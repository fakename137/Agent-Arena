'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use browser APIs
const EnhancedWalletConnectInner = dynamic(
  () => import('./EnhancedWalletConnectInner'),
  {
    ssr: false,
    loading: () => (
      <div
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
      >
        Loading...
      </div>
    ),
  }
);

const EnhancedWalletConnect = () => {
  return <EnhancedWalletConnectInner />;
};

export default EnhancedWalletConnect;
