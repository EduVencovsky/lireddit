import "reflect-metadata"
import { COOKIE_NAME, __prod__ } from "./constants"
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolver/hello"
import { PostResolver } from "./resolver/post"
import { UserResolver } from "./resolver/user"
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'
import { createConnection } from "typeorm"
import { Post } from "./entities/Post"
import { User } from "./entities/User"

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [Post, User]
  })
  
  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis()
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  )
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // years
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https 
      },
      saveUninitialized: false,
      secret: 'oiashdfohhuqhwueuhiuhufha8389rh92h9',
      resave: false,
    })
  )
  app.get('/', (_, res) => res.send('hello'))
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis })
  })

  apolloServer.applyMiddleware({ app, cors: false })

  app.listen(4000, () => {
    console.log('server stated on localhost: 4000')
  })
}

main().catch(error => console.error(error))