import { Box } from '@chakra-ui/core'
import React from 'react'

export interface WrapperProps {
  children: React.ReactNode
  variant?: 'small' | 'regular'
}

export const Wrapper = ({ children, variant }: WrapperProps) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === 'regular' ? '800px' : '400px'}
      w="100%"
    >
      {children}
    </Box>
  )
}