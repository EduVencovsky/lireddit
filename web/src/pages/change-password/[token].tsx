import React, { useState } from 'react'
import { NextPage } from 'next'
import { Box, Button, Flex, FormErrorMessage, Link } from '@chakra-ui/core'
import { Formik, Form } from 'formik'
import { InputField } from '../../components/InputField'
import { Wrapper } from '../../components/Wrapper'
import { toErrorMap } from '../../utils/toErrorMap'
import { useChangePasswordMutation } from '../../generated/graphql'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../../utils/createUrqlClient'

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter()
  const [tokenError, setTokenError] = useState('')
  const [{ }, changePassword] = useChangePasswordMutation()
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({ token, newPassword: values.newPassword })
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if ('token' in errorMap) {
              console.log(errorMap)
              setTokenError(errorMap.token)
            }
            setErrors(errorMap)
          } else if (response.data?.changePassword.user) {
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New Password"
              label="New Password"
              type="password"
            />
            {tokenError && (
              <Flex>
                <Box mr={2} color="#ff0000">
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>
                    Click here to get a new one
                  </Link>
                </NextLink>
              </Flex>

            )}
            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword)