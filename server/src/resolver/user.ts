import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid'
import { getConnection } from "typeorm";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
  @Field()
  email: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext,
  ): Promise<UserResponse> {
    // Could have used validation library like Yup
    if (newPassword.length <= 4) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be greater than 4'
          }
        ]
      }
    }
    const redisKey = FORGET_PASSWORD_PREFIX + token
    const userId = await redis.get(redisKey)
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired'
          }
        ]
      }
    }
    const userIdNum = parseInt(userId)
    const user = await User.findOne(userIdNum)
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists'
          }
        ]
      }
    }

    await User.update({ id: userIdNum }, {
      password: await argon2.hash(newPassword)
    })

    await redis.del(redisKey)
    // log in user after change password
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return true
    }
    const token = v4()
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 // 1 day
    )
    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    )
    return true
  }

  @Query(() => User, { nullable: true })
  me(
    @Ctx() { req }: MyContext
  ) {
    if (!req.session.userId) {
      return undefined
    }
    return User.findOne(req.session.userId)
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') { username, password, email }: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // Could have used validation library like Yup
    if (!email.includes('@')) {
      return {
        errors: [
          {
            field: 'email',
            message: 'email must be a valid'
          }
        ]
      }
    }
    // Could have used validation library like Yup
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 2'
          }
        ]
      }
    }
    // Could have used validation library like Yup
    if (password.length <= 4) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 4'
          }
        ]
      }
    }

    const hashedPassword = await argon2.hash(password)
    let user;
    // const user = em.create(User, { username, password: hashedPassword })
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username,
          email,
          password: hashedPassword,
        })
        .returning('*')
        .execute()
      user = result.raw[0]
    } catch (err) {
      if (err.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already exists'
            }
          ]
        }
      }
    }

    // set cookie user
    // login after register
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@') ?
        { where: { email: usernameOrEmail } } :
        { where: { username: usernameOrEmail } }
    )
    if (!user) {
      return {
        errors: [{
          field: 'usernameOrEmail',
          message: 'Username or Email doesn\'t exists'
        }]
      }
    }
    const isPasswordValid = await argon2.verify(user.password, password)
    if (!isPasswordValid) {
      return {
        errors: [{
          field: 'password',
          message: 'Invalid password'
        }]
      }
    }

    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ) {
    return new Promise(resolve => req.session.destroy(err => {
      res.clearCookie(COOKIE_NAME)
      if (err) {
        console.log(err)
        resolve(false)
        return;
      }
      resolve(true)
    })
    )
  }
}