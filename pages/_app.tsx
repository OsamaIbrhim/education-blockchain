import React, { useEffect } from 'react'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { useRouter } from 'next/router'
import { LanguageProvider } from 'context/LanguageContext'
import Layout from 'components/layout/Layout'
import theme from '../styles/theme'

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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const noLayoutRoutes = ['/', '/login']
  const showLayout = !noLayoutRoutes.includes(router.pathname)

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

  const renderWithLayout = (
    <Layout allowedValue={null}>
      <Component {...pageProps} />
    </Layout>
  )

  const renderWithoutLayout = <Component {...pageProps} />

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <LanguageProvider>
        <ChakraProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
              {showLayout ? renderWithLayout : renderWithoutLayout}
            </WagmiProvider>
          </QueryClientProvider>
        </ChakraProvider>
      </LanguageProvider>
    </>
  )
}
