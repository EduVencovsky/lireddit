import { Box, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Layout } from '../components/Layout'
import { Wrapper } from '../components/Wrapper'
import { useCretePostMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const CreatePost = ({ }) => {
  const router = useRouter()
  const [, createPost] = useCretePostMutation()
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          const result = await createPost({ input: values })
          router.push('/')
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Title"
              label="Title"
            />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Body"
              />
            </Box>
            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Create Post</Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient)(CreatePost)