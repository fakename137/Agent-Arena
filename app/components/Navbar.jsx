// File: components/Navbar.jsx
'use client'; // Important for using hooks in Next.js App Router

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, usePublicClient } from 'wagmi'; // Import wagmi hooks
import { injected } from 'wagmi/connectors'; // Import the injected connector (for Sequence, MetaMask, etc.)
import { usePrivy } from '@privy-io/react-auth';
import EnhancedWalletConnect from './EnhancedWalletConnect';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  // --- Use wagmi hooks for state and actions ---
  const { address, isConnected, chainId } = useAccount(); // Get account state
  const { connect, connectors } = useConnect(); // Get connect function and available connectors
  const { disconnect } = useDisconnect(); // Get disconnect function
  // --- End wagmi hooks ---

  // --- Privy hooks ---
  const { ready, authenticated, user } = usePrivy();
  // --- End Privy hooks ---

  // --- State for Chain Name ---
  const [chainName, setChainName] = useState('Unknown Network');
  // --- End Chain Name State ---

  // --- Map Chain ID to Name ---
  // Populate with relevant chain IDs
  const chainIdToNameMap = {
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    42161: 'Arbitrum One',
    11155111: 'Ethereum Sepolia', // Sepolia Testnet
    80001: 'Polygon Mumbai', // Mumbai Testnet
    421613: 'Arbitrum Goerli', // Goerli Testnet
    // --- Add your specific network ID here ---
    // Replace 'YOUR_ETHERLINK_TESTNET_CHAIN_ID' with the actual number (e.g., '12345')
    // You need to find the correct chainId for the Etherlink Testnet you are using.
    128123: 'Etherlink Testnet',
    // Add more mappings as needed
  };
  // --- End Mapping ---

  // --- Update Chain Name when chainId changes ---
  useEffect(() => {
    if (chainId) {
      const name =
        chainIdToNameMap[chainId.toString()] || `Chain ID: ${chainId}`;
      setChainName(name);
    } else {
      setChainName('Not Connected');
    }
  }, [chainId]); // Re-run when chainId changes
  // --- End Update ---

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Check if user is connected via either method
  const isUserConnected = isConnected || authenticated;
  const currentAddress = address || user?.wallet?.address;

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 30px',
          zIndex: 9999,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Left side - The Hash Pit */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1
            style={{
              color: '#ff0000',
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '1px',
            }}
          >
            The Hash Pit
          </h1>
        </div>
        {/* Right side - Enhanced Wallet Connect */}
        <EnhancedWalletConnect />
      </nav>

      {/* Dropdown Modal */}
      {showDropdown && isUserConnected && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '30px',
            width: '350px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 9998,
            padding: '20px',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                color: '#ff0000',
                fontSize: '18px',
              }}
            >
              Wallet Info
            </h3>
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              <div>Address: {formatAddress(currentAddress)}</div>
              {/* --- Display Real Chain Name --- */}
              <div style={{ marginTop: '5px' }}>
                Chain: <span style={{ color: '#8b5cf6' }}>{chainName}</span>
                {/* Optionally display raw Chain ID for debugging:
                {chainId && <span style={{ color: '#aaa', fontSize: '12px' }}> (ID: {chainId})</span>}
                */}
              </div>
              {/* --- End Display --- */}
            </div>
          </div>
          {/* NFT Assets Section */}
          {/* ... (rest of your dropdown content like NFT list) ... */}
          {/* Close Button */}
          <button
            onClick={() => setShowDropdown(false)}
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff6666';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ff4444';
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
