import React from 'react'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { usePostQuery } from '../../generated/graphql'
import { useRouter } from 'next/router'
import { Layout } from '../../components/Layout'
import { Box, Heading } from '@chakra-ui/core'
import { useGetPostFromUrl } from '../../hooks/useGetPostFromUrl'

interface PostProps { }

export const Post = ({ }) => {
  const [{ data, error, fetching }] = useGetPostFromUrl()

  if (fetching) {
    return (
      <Layout>
        Loading ...
      </Layout>
    )
  }

  if (error) {
    return <div>{error.message}</div>
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>
          could not find post
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading mb={4}>
        {data.post.title}
      </Heading>
      {data.post.text}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post)