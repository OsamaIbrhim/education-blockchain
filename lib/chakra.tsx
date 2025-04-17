import { ChakraProvider, ChakraProviderProps } from '@chakra-ui/react'
import theme from '../styles/theme'

interface ChakraProps extends Omit<ChakraProviderProps, 'theme'> {
  children: React.ReactNode
}

export function Chakra({ children, ...props }: ChakraProps) {
  return (
    <ChakraProvider theme={theme} {...props}>
      {children}
    </ChakraProvider>
  )
} 