import { Box, Flex, Link, Button } from '@chakra-ui/core'
import { Formik, Form } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'
import login from './login'

const ForgotPassword = () => {
  const [isComplete, setIsComplete] = useState(false)
  const router = useRouter()
  const [{ }, forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values, { setErrors }) => {
          await forgotPassword(values)
          setIsComplete(true)
        }}
      >
        {({ isSubmitting }) => (
          isComplete ? (
            <Box>
              If an account with that email exists, we sent you an email
            </Box>
          ) : (
              <Form>
                <InputField
                  name="email"
                  placeholder="Email"
                  label="Email"
                />
                <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Forgot Password</Button>
              </Form>
            ))}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)