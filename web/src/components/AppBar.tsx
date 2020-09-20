import { Box, Flex, Link, Button } from '@chakra-ui/core'
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
      <Flex>
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
    <Flex bg="tan" p={4}>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  )
}