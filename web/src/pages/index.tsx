import { withUrqlClient } from 'next-urql'
import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useDeletePostMutation, useMeQuery, usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import NextLink from 'next/link'
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from '@chakra-ui/core'
import { UpdootSection } from '../components/UpdootSection'

const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string })
  const [{ data, fetching }] = usePostsQuery({
    variables
  })

  const [{ data: meData }] = useMeQuery()
  const [, deletePost] = useDeletePostMutation()

  if (!fetching && !data) {
    return (
      <div>
        Failed to query for some reason
      </div>
    )
  }
  return (
    <Layout variant="regular">
      {!data && fetching ? (
        <div>Loading</div>
      ) :
        <Stack spacing={8}>
          {data?.posts.posts.map(p => !p ? null : (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p} />
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize="xl">{p.title}</Heading>
                  </Link>
                </NextLink>
                <Text>
                  Posted by {p.creator.username}
                </Text>
                <Flex>
                  <Text flex={1} mt={4}>{p.textSnippet}</Text>
                  {meData?.me?.id !== p.creator.id ? null : <Box ml="auto">
                    <NextLink href='/post/edit/[id]' as={`/post/edit/${p.id}`}>
                      <IconButton
                        as={Link}
                        mr={4}
                        icon="edit"
                        aria-label="Edit Post"
                      />
                    </NextLink>
                    <IconButton
                      ml="auto"
                      icon="delete"
                      aria-label="DeletePost"
                      onClick={() => deletePost({ id: p.id })}
                    />
                  </Box>
                  }
                </Flex>
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
