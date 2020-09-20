import { cacheExchange } from "@urql/exchange-graphcache"
import { dedupExchange, fetchExchange } from "urql"
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery"

export const createUrqlClient = (ssrEchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
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
    fetchExchange,
    ssrEchange
  ],
})