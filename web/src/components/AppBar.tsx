import { Box, Flex, Link, Button, Heading } from '@chakra-ui/core'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'

interface AppBarProps { }

export const AppBar = ({ }: AppBarProps) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()
  const [{ data, fetching }] = useMeQuery({
    pause: isServer()
  })
  let body = null

  if (fetching) {

  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link mr={2}>Register</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Box mr={4}>
          {data.me.username}
        </Box>
        <Button onClick={() => logout()} variant="link" isLoading={logoutFetching}>
          Logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4} align="center">
      <Flex maxW={800} flex={1} align="center" margin="auto">
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml='auto'>
          {body}
        </Box>
      </Flex>
    </Flex>
  )
}