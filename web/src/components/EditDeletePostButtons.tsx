import React from 'react'
import NextLink from 'next/link'
import { Box, IconButton, Link } from '@chakra-ui/core'
import { useDeletePostMutation, useMeQuery } from '../generated/graphql'


interface EditDeleetePostButtonsProps {
  id: number
  creatorId: number
}

export const EditDeletePostButtons = ({
  id,
  creatorId
}: EditDeleetePostButtonsProps) => {
  const [{ data: meData }] = useMeQuery()
  const [, deletePost] = useDeletePostMutation()

  if (meData?.me?.id !== creatorId) {
    return null
  }

  return (
    <Box ml="auto">
      <NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
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
        onClick={() => deletePost({ id })}
      />
    </Box>
  )
}