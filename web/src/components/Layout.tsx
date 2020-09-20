import App from 'next/app'
import React from 'react'
import { AppBar } from './AppBar'
import { Wrapper, WrapperProps } from './Wrapper'

interface LayoutProps {
  variant: WrapperProps['variant']
  children: React.ReactNode
}

export const Layout = ({ variant, children }: LayoutProps) => {
  return (
    <>
      <AppBar />
      <Wrapper variant={variant}>
        {children}
      </Wrapper>
    </>
  )

}