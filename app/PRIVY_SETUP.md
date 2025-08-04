# Privy Wallet Integration Setup

This guide explains how to set up Privy for enhanced wallet connection options in The Hash Pit.

## What is Privy?

Privy is a comprehensive authentication and wallet connection solution that provides:

- Multiple wallet connection options (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- Social login options (Google, Twitter, Discord, etc.)
- Email/phone authentication
- Embedded wallets for users without existing wallets
- Cross-platform compatibility

## Setup Instructions

### 1. Get a Privy App ID

1. Go to [Privy Dashboard](https://console.privy.io/)
2. Sign up or log in to your account
3. Create a new app
4. Copy your App ID from the dashboard

### 2. Configure Environment Variables

Create a `.env.local` file in the `app` directory with the following content:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here

# Sequence Configuration (existing)
NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY=AQAAAAAAAKginxKG4zKCwYbUzdsw_qxHBKk
NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY=eyJwcm9qZWN0SWQiOjQzMDQyLCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0=
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=c4f79cc821944d9680842e34466bfbd9
```

Replace `your-privy-app-id-here` with your actual Privy App ID.

### 3. Features Added

The enhanced wallet connection now includes:

#### Universal Connect Wallet Button

- **Single "Connect Wallet" button** - Opens a modal with all available options
- **Clean, unified interface** - No multiple buttons cluttering the UI
- **Smart detection** - Automatically shows available options based on configuration

#### Sequence Wallet (Existing)

- Direct connection to Sequence wallet extension
- Supports Etherlink Testnet (Chain ID: 128123)
- Traditional wallet connection flow

#### Privy Wallet Options (New)

- **MetaMask**: Connect with MetaMask extension
- **WalletConnect**: QR code connection for mobile wallets
- **Coinbase Wallet**: Connect with Coinbase Wallet
- **Social Logins**: Google, Twitter, Discord authentication
- **Email/Phone**: Traditional authentication methods
- **Embedded Wallets**: Auto-created wallets for new users

### 4. User Experience

When users click "Connect Wallet", they now see:

1. **Single "Connect Wallet" button** - Opens universal modal
2. **Modal with options**:
   - **Sequence Wallet** - Direct connection to Sequence
   - **More Options** - Opens Privy with MetaMask, WalletConnect, Social Login, etc.
3. **Information section** - Shows supported networks and features

The interface automatically detects which wallet type is connected and displays appropriate information.

### 5. Configuration Options

In `_app.js`, you can customize Privy behavior:

```javascript
<PrivyProvider
  appId={privyAppId}
  config={{
    embeddedWallets: {
      createOnLogin: "all-users", // or "users-without-wallets"
    },
    defaultChainId: 128123, // Etherlink Testnet
    supportedChainIds: [128123], // Only Etherlink Testnet
    // Add more configuration options as needed
  }}
>
```

### 6. Troubleshooting

#### Common Issues:

1. **"Privy App ID not found"**

   - Ensure your `.env.local` file exists and contains the correct App ID
   - Restart your development server after adding environment variables

2. **Dependency conflicts**

   - The installation used `--legacy-peer-deps` to resolve conflicts
   - If you encounter issues, try: `npm install --legacy-peer-deps`

3. **Wallet not connecting**

   - Check browser console for error messages
   - Ensure you're on the correct network (Etherlink Testnet)
   - Try refreshing the page

### 7. Customization

You can customize the wallet connection UI by modifying:

- `EnhancedWalletConnect.jsx` - Main wallet connection component
- `EnhancedWalletConnectInner.jsx` - Inner component with wallet logic
- `Navbar.jsx` - Navigation bar integration
- `_app.js` - Privy provider configuration

### 8. Security Notes

- Never commit your Privy App ID to version control
- Use environment variables for all sensitive configuration
- Test thoroughly on testnet before deploying to mainnet

## Support

For more information about Privy:

- [Privy Documentation](https://docs.privy.io/)
- [Privy Dashboard](https://console.privy.io/)
- [Privy GitHub](https://github.com/privy-io)
