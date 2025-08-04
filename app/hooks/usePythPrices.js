// Mock Pyth Price Stream Hook
import { useState, useEffect } from 'react';

/**
 * Mock hook to simulate BTC and ETH price streaming
 * @param {boolean} enabled - Whether to start the stream or not.
 * @returns {Object} { btcPrice: number | null, ethPrice: number | null, loading: boolean, error: string | null }
 */
export const usePythPriceStream = (enabled = true) => {
  const [prices, setPrices] = useState({ btcPrice: null, ethPrice: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setPrices({
        btcPrice: 45000 + Math.random() * 5000, // Random BTC price around $45k-$50k
        ethPrice: 2500 + Math.random() * 500, // Random ETH price around $2.5k-$3k
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [enabled]);

  return { ...prices, loading, error };
};
