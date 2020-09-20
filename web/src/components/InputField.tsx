import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/core'
import { useField } from 'formik'
import React from 'react'

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  textarea?: boolean
  placeholder: string
}

export const InputField = ({ 
  label, 
  size: _, 
  textarea,
  ...otherProps
}: InputFieldProps) => {
  const [field, { error }] = useField(otherProps)
  
  let Component = textarea ? Textarea : Input
  
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Component {...field} {...otherProps} id={field.name} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}