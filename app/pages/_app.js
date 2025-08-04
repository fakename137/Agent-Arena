// pages/_app.js
import '../styles/globals.css';
import { SequenceConnect, createConfig } from '@0xsequence/connect';
import Head from 'next/head';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  // 🔐 Your Sequence Keys (from dashboard)
  const projectAccessKey =
    process.env.NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY ||
    'AQAAAAAAAKginxKG4zKCwYbUzdsw_qxHBKk';
  const waasConfigKey =
    process.env.NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY ||
    'eyJwcm9qZWN0SWQiOjQzMDQyLCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0=';
  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    'c4f79cc821944d9680842e34466bfbd9';

  // ⚙️ Sequence WaaS Config
  const config = createConfig('waas', {
    projectAccessKey,
    position: 'center',
    defaultTheme: 'dark',
    signIn: {
      projectName: 'The Hash Pit',
    },
    defaultChainId: 128123, // Etherlink Testnet
    chainIds: [128123], // Only Etherlink Testnet
    appName: 'The Hash Pit',
    waasConfigKey,
    google: false,
    apple: false,
    walletConnect: {
      projectId: walletConnectProjectId,
    },
    coinbase: false,
    metaMask: true,
    // Remove wagmiConfig to avoid conflicts with wagmi v2
    enableConfirmationModal: true,
  });

  const handleBuyCharacters = () => {
    // Add your buy characters logic here
    console.log('Buy Characters clicked');
    // You can redirect to a marketplace or open a modal
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SequenceConnect config={config}>
        <Navbar />
        {/* Buy Characters Button */}

        <div>
          {' '}
          {/* Increased padding to accommodate both navbar and button */}
          <Component {...pageProps} />
        </div>
      </SequenceConnect>
    </>
  );
}

export default MyApp;
