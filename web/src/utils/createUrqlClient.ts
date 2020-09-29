import { cacheExchange, Resolver } from "@urql/exchange-graphcache"
import { dedupExchange, fetchExchange, stringifyVariables } from "urql"
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, VoteMutationVariables } from "../generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery"
import { pipe, tap } from 'wonka'
import { Exchange } from 'urql'
import Router from 'next/router'
import gql from 'graphql-tag'
import { isServer } from "./isServer"

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login')
      }
    })
  )
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}${stringifyVariables(fieldArgs)}`
    const isInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    )
    info.partial = !isInTheCache

    let results: string[] = []
    let hasMore = true
    fieldInfos.forEach(fi => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string
      const data = cache.resolve(key, 'posts') as string[]
      const _hasMore = cache.resolve(key, 'hasMore')
      if (!_hasMore) hasMore = _hasMore as boolean
      results.push(...data)
    })

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }
  };
};

export const createUrqlClient = (ssrEchange: any, ctx: any) => {
  let cookie = ''
  if (isServer()) cookie = ctx.req.headers.cookie
  
  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie ? { cookie } : undefined
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination()
          }
        },
        updates: {
          Mutation: {
            vote: (result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables
              const data = cache.readFragment(
                gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
                { id: postId } as any
              )

              if (data) {
                if (data.voteStatus === args.value) return
                const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value
                cache.writeFragment(
                  gql`
                  fragment __ on Post {
                    points
                    voteStatus
                  }
                `,
                  { id: postId, points: newPoints, voteStatus: value } as any
                )
              }
            },
            createPost: (result, args, cache, info) => {
              const allFields = cache.inspectFields('Query');
              const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
              fieldInfos.forEach((fi) => {
                cache.invalidate('Query', 'posts', fi.arguments || {})
              })
            },
            logout: (result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                () => ({ me: null })
              )
            },
            login: (result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (innerResult, query) => {
                  if (innerResult.login.errors) {
                    return query
                  } else {
                    return {
                      me: innerResult.login.user
                    }
                  }
                })
            },
            register: (result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (innerResult, query) => {
                  if (innerResult.register.errors) {
                    return query
                  } else {
                    return {
                      me: innerResult.register.user
                    }
                  }
                })
            }
          }
        }
      }),
      errorExchange,
      ssrEchange,
      fetchExchange,
    ],
  }
}