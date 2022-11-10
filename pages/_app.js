import '../styles/globals.css'
import {
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from 'wagmi'
 
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
 
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { ChakraProvider } from '@chakra-ui/react'

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  alchemyProvider({ apiKey: 'cwozscIRJ6ML9o8e1E2CJ2szoJ8S4uqU' }),
  publicProvider(),
])
 
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
})

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={client}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </WagmiConfig>
  )
}

export default MyApp
