import React from 'react'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
})

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      }
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'red',
      }
    },
    Toast: {
      defaultProps: {
        position: 'top',
        isClosable: true,
        duration: 3000,
      }
    }
  }
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      console.log('Route changing to:', url)
    }

    const handleRouteChangeComplete = (url: string) => {
      console.log('Route change completed:', url)
    }

    const handleRouteChangeError = (err: any, url: string) => {
      console.error('Route change error:', { url, err })
    }

    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    router.events.on('routeChangeError', handleRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      router.events.off('routeChangeError', handleRouteChangeError)
    }
  }, [router])

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <Component {...pageProps} />
        </WagmiProvider>
      </QueryClientProvider>
    </ChakraProvider>
  )
} 