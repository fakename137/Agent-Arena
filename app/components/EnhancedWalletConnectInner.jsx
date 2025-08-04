'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, usePublicClient } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { usePrivy, useLogin } from '@privy-io/react-auth';

const EnhancedWalletConnectInner = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Wagmi hooks for Sequence wallet
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Privy hooks - handle case when Privy is not available
  const privyContext = usePrivy();
  const loginContext = useLogin({
    onComplete: () => {
      setShowWalletModal(false);
    },
  });

  // Check if Privy is available
  const isPrivyAvailable = privyContext && privyContext.ready !== undefined;
  const {
    ready,
    authenticated,
    user,
    logout: privyLogout,
    linkWallet,
  } = privyContext || {};
  const { login } = loginContext || {};

  // State for chain name
  const [chainName, setChainName] = useState('Unknown Network');

  // Map Chain ID to Name
  const chainIdToNameMap = {
    1: 'Ethereum Mainnet',
    137: 'Polygon',
    42161: 'Arbitrum One',
    11155111: 'Ethereum Sepolia',
    80001: 'Polygon Mumbai',
    421613: 'Arbitrum Goerli',
    128123: 'Etherlink Testnet',
  };

  // Update Chain Name when chainId changes
  useEffect(() => {
    if (chainId) {
      const name =
        chainIdToNameMap[chainId.toString()] || `Chain ID: ${chainId}`;
      setChainName(name);
    } else {
      setChainName('Not Connected');
    }
  }, [chainId]);

  const handleSequenceConnect = async () => {
    try {
      console.log('Attempting to connect Sequence wallet...');
      const sequenceConnector = connectors.find(
        (c) => c.id === 'sequence' || c.type === 'injected'
      );
      if (sequenceConnector) {
        connect({ connector: sequenceConnector });
        setShowWalletModal(false);
      } else {
        console.warn('No suitable connector found (e.g., Sequence Wallet).');
        alert('Please install the Sequence Wallet extension.');
      }
    } catch (error) {
      console.error('Error connecting Sequence wallet:', error);
    }
  };

  const handleSequenceDisconnect = async () => {
    try {
      console.log('Disconnecting Sequence wallet...');
      disconnect();
      setShowDropdown(false);
      console.log('Sequence wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting Sequence wallet:', error);
    }
  };

  const handlePrivyConnect = () => {
    login();
  };

  const handlePrivyDisconnect = async () => {
    try {
      await privyLogout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error disconnecting Privy:', error);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Check if user is connected via either method
  const isUserConnected = isConnected || (isPrivyAvailable && authenticated);
  const currentAddress =
    address || (isPrivyAvailable ? user?.wallet?.address : null);
  const currentChainName = isConnected
    ? chainName
    : isPrivyAvailable
    ? 'Privy Wallet'
    : 'Unknown';

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {isUserConnected && currentAddress && (
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: '8px 15px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.3s ease',
            }}
            onClick={toggleDropdown}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {formatAddress(currentAddress)}
          </div>
        )}

        {!isUserConnected && (
          <button
            onClick={() => setShowWalletModal(true)}
            style={{
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 0, 0, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff2222';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ff0000';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.4)';
            }}
          >
            Connect Wallet
          </button>
        )}

        {isUserConnected && (
          <button
            onClick={
              isConnected
                ? handleSequenceDisconnect
                : isPrivyAvailable
                ? handlePrivyDisconnect
                : () => {}
            }
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 0, 0, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff6666';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ff4444';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.4)';
            }}
          >
            Disconnect
          </button>
        )}
      </div>

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
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                color: isConnected ? '#ff0000' : '#8b5cf6',
                fontSize: '18px',
              }}
            >
              Wallet Info
            </h3>
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              <div>Address: {formatAddress(currentAddress)}</div>
              <div style={{ marginTop: '5px' }}>
                Chain:{' '}
                <span style={{ color: '#8b5cf6' }}>{currentChainName}</span>
              </div>
              <div style={{ marginTop: '5px' }}>
                Type:{' '}
                <span style={{ color: isConnected ? '#ff0000' : '#8b5cf6' }}>
                  {isConnected ? 'Sequence Wallet' : 'Privy Wallet'}
                </span>
              </div>
            </div>
          </div>

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

      {/* Universal Wallet Connection Modal */}
      {showWalletModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <h2 style={{ marginBottom: '20px', color: '#ff0000' }}>
              Connect Your Wallet
            </h2>
            <p style={{ marginBottom: '30px', color: '#ccc' }}>
              Choose your preferred wallet connection method
            </p>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              {/* Sequence Wallet Option */}
              <button
                onClick={handleSequenceConnect}
                style={{
                  backgroundColor: '#ff0000',
                  color: 'white',
                  border: 'none',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ff2222';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ff0000';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '20px' }}>🔗</span>
                Sequence Wallet
              </button>

              {/* Privy Options */}
              {isPrivyAvailable && (
                <button
                  onClick={handlePrivyConnect}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    top: '50%',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#7c3aed';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#8b5cf6';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🔐</span>
                  More Options (MetaMask, WalletConnect, Social Login)
                </button>
              )}

              {/* Cancel Button */}
              <button
                onClick={() => setShowWalletModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ccc',
                  border: '1px solid #ccc',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '10px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
            </div>

            {/* Info Section */}
            <div
              style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#aaa',
              }}
            >
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Supported Networks:</strong> Etherlink Testnet
              </p>
              <p style={{ margin: 0 }}>
                <strong>Features:</strong> MetaMask, WalletConnect, Social
                Login, Email/Phone, Embedded Wallets
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedWalletConnectInner;
