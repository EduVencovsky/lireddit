import { withUrqlClient } from 'next-urql'
import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import NextLink from 'next/link'
import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core'

const Index = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: null as null | string})
  const [{ data, fetching }] = usePostsQuery({
    variables
  })

  if (!fetching && !data) {
    return (
      <div>
        Failed to query for some reason
      </div>
    )
  }
  return (
    <Layout variant="regular">
      <Flex align="center">
        <Heading>
          LiReddit
        </Heading>
        <NextLink href="/create-post">
          <Link ml="auto">
            Create Post
          </Link>
        </NextLink>
      </Flex>
      {!data && fetching ? (
        <div>Loading</div>
      ) :
        <Stack spacing={8}>
          {data?.posts.posts.map(p => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      }
      {data && data.posts.hasMore && (
        <Flex>
          <Button onClick={() => {
            setVariables(prev => ({
              ...prev,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
            }))
          }} isLoading={fetching} m="auto" my={8}>
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
