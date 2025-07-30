// pages/_app.js
import '../styles/globals.css';
import { SequenceConnect, createConfig } from '@0xsequence/connect';

function MyApp({ Component, pageProps }) {
  // 🔐 Your Sequence Keys (from dashboard)
  const projectAccessKey = 'AQAAAAAAAKginxKG4zKCwYbUzdsw_qxHBKk'; // ← Replace with yours
  const waasConfigKey =
    'eyJwcm9qZWN0SWQiOjQzMDQyLCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0='; // ← Replace
  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID; // ← Get from WalletConnect Cloud

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
    wagmiConfig: {
      multiInjectedProviderDiscovery: true,
    },
    enableConfirmationModal: true,
  });

  return (
    <SequenceConnect config={config}>
      <Component {...pageProps} />
    </SequenceConnect>
  );
}

export default MyApp;
