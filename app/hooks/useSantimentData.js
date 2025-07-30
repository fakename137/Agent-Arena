// src/hooks/useSantimentData.js
import { useEffect, useState } from 'react';

// IMPORTANT: Replace 'YOUR_SANTIMENT_API_KEY' with your actual Santiment API key.
const SANTIMENT_API_KEY = 'ewsdwmhxl7gxx5ix_qulnztpkxkur26h2';
const SANTIMENT_API_URL = 'https://api.santiment.net/graphql';

/**
 * Custom hook to fetch basic Santiment data for BTC and ETH.
 * This example fetches transaction volume for the last 5 minutes.
 * You can extend this to fetch other metrics like social volume, fees, etc.
 * @returns {Object} { btcTxPerMin: number | null, ethTxPerMin: number | null, loading: boolean, error: string | null }
 */
export const useSantimentData = () => {
  const [data, setData] = useState({ btcTxPerMin: null, ethTxPerMin: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTxVolume = async (slug) => {
      // Calculate the 'to' time as now, and 'from' time as 5 minutes ago
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

      // GraphQL query to get transaction volume
      const query = `
        query {
          transactionVolume(slug: "${slug}", from: "${from}", to: "${to}", interval: "5m") {
            datetime
            transactionVolume
          }
        }
      `;

      try {
        const response = await fetch(SANTIMENT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Apikey ${SANTIMENT_API_KEY}`, // Include API key
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Santiment API error for ${slug}:`,
            response.status,
            errorText
          );
          throw new Error(`HTTP error for ${slug}! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          console.error(`Santiment GraphQL errors for ${slug}:`, result.errors);
          throw new Error(
            `GraphQL error for ${slug}: ${result.errors[0].message}`
          );
        }

        // console.log(`Santiment data for ${slug}:`, result); // For debugging

        // Extract the transaction volume from the result
        // The API returns data for the last 5 minutes aggregated.
        if (
          result.data &&
          result.data.transactionVolume &&
          result.data.transactionVolume.length > 0
        ) {
          // Get the latest data point (should be the only one for a 5m interval covering the last 5 mins)
          const latestDataPoint =
            result.data.transactionVolume[
              result.data.transactionVolume.length - 1
            ];
          const txCount = latestDataPoint.transactionVolume;
          // Convert to transactions per minute
          const txPerMin = txCount / 5; // 5 minute interval
          return txPerMin;
        } else {
          console.warn(`No transaction volume data returned for ${slug}`);
          return 0; // Or null, depending on how you want to handle missing data
        }
      } catch (err) {
        console.error(
          `Error fetching transaction volume for ${slug} from Santiment:`,
          err
        );
        throw err; // Re-throw to be caught by Promise.allSettled
      }
    };

    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch transaction volume for both BTC and ETH concurrently
        const results = await Promise.allSettled([
          fetchTxVolume('bitcoin'),
          fetchTxVolume('ethereum'),
        ]);

        if (!isMounted) return;

        let btcTxPerMin = null;
        let ethTxPerMin = null;
        let errorMessage = null;

        // Process results
        if (results[0].status === 'fulfilled') {
          btcTxPerMin = results[0].value;
        } else {
          errorMessage = `BTC Tx Volume Error: ${results[0].reason.message}`;
        }

        if (results[1].status === 'fulfilled') {
          ethTxPerMin = results[1].value;
        } else {
          errorMessage = errorMessage
            ? `${errorMessage}; ETH Tx Volume Error: ${results[1].reason.message}`
            : `ETH Tx Volume Error: ${results[1].reason.message}`;
        }

        if (errorMessage) {
          throw new Error(errorMessage);
        }

        setData({ btcTxPerMin, ethTxPerMin });
      } catch (err) {
        console.error('Error in Santiment fetchData:', err);
        if (isMounted) {
          setError(err.message || 'Failed to fetch Santiment data');
          setData({ btcTxPerMin: null, ethTxPerMin: null }); // Reset data on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Example: Poll every 1 minute (60000 ms)
    // Adjust frequency based on your needs and API rate limits.
    const intervalId = setInterval(fetchData, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this runs once on mount, then is managed by interval

  return { ...data, loading, error };
};
