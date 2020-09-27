import { Flex, IconButton } from '@chakra-ui/core'
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql'

interface UpdootSectionProps {
  post: PostSnippetFragment
}

export const UpdootSection = ({ post }: UpdootSectionProps) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | 'not-loading'
  >('not-loading')
  const [, vote] = useVoteMutation()
  return (
    <Flex
      direction='column'
      alignItems="center"
      justifyContent="center"
      mr={4}
    >
      <IconButton
        onClick={async () => {
          setLoadingState('updoot-loading')
          vote({ postId: post.id, value: 1 })
          setLoadingState('not-loading')
        }}
        aria-label="up vote"
        isLoading={loadingState === 'updoot-loading'}
        icon="chevron-up"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          setLoadingState('downdoot-loading')
          vote({ postId: post.id, value: -1 })
          setLoadingState('not-loading')
        }}
        aria-label="down vote"
        isLoading={loadingState === 'downdoot-loading'}
        icon="chevron-down"
      />
    </Flex>
  )
}