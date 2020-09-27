import { withUrqlClient } from 'next-urql'
import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import NextLink from 'next/link'
import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text } from '@chakra-ui/core'
import { UpdootSection } from '../components/UpdootSection'

const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string })
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
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p} />
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text>
                  Posted by {p.creator.username}
                </Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
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
