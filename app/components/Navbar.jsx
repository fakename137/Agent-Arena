import React, { useState, useEffect } from 'react';
import { useOpenConnectModal } from '@0xsequence/connect';

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const connectModalHook = useOpenConnectModal();
  const setOpenConnectModal =
    connectModalHook?.setOpenConnectModal || (() => {});

  // Static NFT assets data
  const nftAssets = [
    {
      id: 1,
      name: 'Bitcoin Brad',
      image: '/characters/Brad.fbx',
      rarity: 'Legendary',
      chain: 'Etherlink Testnet',
    },
    {
      id: 2,
      name: 'Ethereum Remy',
      image: '/characters/Remy.fbx',
      rarity: 'Epic',
      chain: 'Etherlink Testnet',
    },
    {
      id: 3,
      name: 'Solana Sam',
      image: '/characters/Ch06_nonPBR.fbx',
      rarity: 'Rare',
      chain: 'Etherlink Testnet',
    },
  ];

  // Check for existing wallet connection on mount and listen for changes
  useEffect(() => {
    const checkWalletConnection = () => {
      try {
        // Check localStorage for wallet state
        const hasWallet = localStorage.getItem('wallet-connected') === 'true';
        const storedAddress = localStorage.getItem('wallet-address');

        if (hasWallet && storedAddress) {
          setIsConnected(true);
          setAddress(storedAddress);
        }
      } catch (error) {
        console.warn('Error checking wallet connection:', error);
      }
    };

    // Check on mount
    checkWalletConnection();

    // Listen for storage changes (when wallet connects/disconnects)
    const handleStorageChange = (e) => {
      if (e.key === 'wallet-connected' || e.key === 'wallet-address') {
        checkWalletConnection();
      }
    };

    // Listen for custom events from Sequence
    const handleWalletConnect = (event) => {
      if (event.detail && event.detail.address) {
        setIsConnected(true);
        setAddress(event.detail.address);
        localStorage.setItem('wallet-connected', 'true');
        localStorage.setItem('wallet-address', event.detail.address);
      }
    };

    const handleWalletDisconnect = () => {
      setIsConnected(false);
      setAddress(null);
      localStorage.removeItem('wallet-connected');
      localStorage.removeItem('wallet-address');
    };

    // Listen for actual Sequence wallet connection
    const handleSequenceConnect = async () => {
      try {
        // Wait a bit for the connection to complete
        setTimeout(async () => {
          // Try to get the actual connected address from Sequence
          if (window.sequence && window.sequence.getAddress) {
            try {
              const realAddress = await window.sequence.getAddress();
              if (realAddress) {
                setIsConnected(true);
                setAddress(realAddress);
                localStorage.setItem('wallet-connected', 'true');
                localStorage.setItem('wallet-address', realAddress);
                console.log('Real wallet connected:', realAddress);
              }
            } catch (error) {
              console.warn('Error getting real address:', error);
            }
          }
        }, 3000); // Wait 3 seconds for connection to complete
      } catch (error) {
        console.warn('Error in sequence connect handler:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wallet-connected', handleWalletConnect);
    window.addEventListener('wallet-disconnected', handleWalletDisconnect);
    window.addEventListener('sequence-connect', handleSequenceConnect);

    // Also check periodically for changes
    const interval = setInterval(checkWalletConnection, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wallet-connected', handleWalletConnect);
      window.removeEventListener('wallet-disconnected', handleWalletDisconnect);
      window.removeEventListener('sequence-connect', handleSequenceConnect);
      clearInterval(interval);
    };
  }, []);

  const handleWalletAction = () => {
    if (isConnected) {
      // Disconnect - use a safer approach
      try {
        // Clear local state
        setIsConnected(false);
        setAddress(null);
        setShowDropdown(false);
        localStorage.removeItem('wallet-connected');
        localStorage.removeItem('wallet-address');

        // Try to disconnect from Sequence if possible
        if (window.sequence && window.sequence.disconnect) {
          window.sequence.disconnect();
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('wallet-disconnected'));

        // Force page reload to clear any remaining state
        window.location.reload();
      } catch (error) {
        console.warn('Error during disconnect:', error);
        // Fallback: just clear local state
        setIsConnected(false);
        setAddress(null);
        setShowDropdown(false);
        localStorage.removeItem('wallet-connected');
        localStorage.removeItem('wallet-address');
      }
    } else {
      // Open connect modal
      try {
        setOpenConnectModal(true);

        // Listen for actual connection
        setTimeout(() => {
          // Dispatch custom event to trigger real connection detection
          window.dispatchEvent(new CustomEvent('sequence-connect'));
        }, 1000);
      } catch (error) {
        console.warn('Error opening connect modal:', error);
      }
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Transparent background
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 30px',
          zIndex: 9999, // Keep high z-index to be above iframe
          backdropFilter: 'blur(8px)', // Subtle blur effect
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', // Subtle shadow
        }}
      >
        {/* Left side - The Hash Pit */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              color: '#ff0000',
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Darker shadow for better visibility
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '1px',
            }}
          >
            The Hash Pit
          </h1>
        </div>

        {/* Right side - Connect Wallet */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          {isConnected && address && (
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
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
              {formatAddress(address)}
            </div>
          )}
          <button
            onClick={handleWalletAction}
            style={{
              backgroundColor: isConnected ? '#ff4444' : '#ff0000',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 0, 0, 0.4)', // Enhanced shadow for visibility
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isConnected
                ? '#ff6666'
                : '#ff2222';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = isConnected
                ? '#ff4444'
                : '#ff0000';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.4)';
            }}
          >
            {isConnected ? 'Disconnect' : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      {/* Dropdown Modal */}
      {showDropdown && isConnected && (
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
              <div>Address: {formatAddress(address)}</div>
              <div style={{ marginTop: '5px' }}>
                Chain:{' '}
                <span style={{ color: '#8b5cf6' }}>Etherlink Testnet</span>
              </div>
            </div>
          </div>

          {/* NFT Assets Section */}
          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '16px' }}
            >
              NFT Assets ({nftAssets.length})
            </h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {nftAssets.map((nft) => (
                <div
                  key={nft.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#8b5cf6',
                      borderRadius: '8px',
                      marginRight: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    🥊
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {nft.name}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#ccc',
                        marginTop: '2px',
                      }}
                    >
                      {nft.rarity} • {nft.chain}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
