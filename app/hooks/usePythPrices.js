// // src/hooks/usePythPriceStream.js
// import { useEffect, useState } from 'react';

// // Pyth Price Feed IDs (Mainnet)
// const PYTH_BTC_USD_ID =
//   '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';
// const PYTH_ETH_USD_ID =
//   '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';

// const HERMES_SSE_ENDPOINT =
//   'https://hermes.pyth.network/v2/updates/price/stream';

// /**
//  * Custom hook to stream BTC and ETH prices from Pyth using SSE.
//  * @param {boolean} enabled - Whether to start the stream or not.
//  * @returns {Object} { btcPrice: number | null, ethPrice: number | null, loading: boolean, error: string | null }
//  */
// export const usePythPriceStream = (enabled = true) => {
//   const [prices, setPrices] = useState({ btcPrice: null, ethPrice: null });
//   const [loading, setLoading] = useState(true); // Initially loading until first data
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!enabled) {
//       return; // Don't connect if not enabled
//     }

//     let eventSource = null;
//     let isMounted = true;
//     let initialLoad = true;

//     const connect = () => {
//       // Construct the URL with the IDs you want
//       const url = new URL(HERMES_SSE_ENDPOINT);
//       url.searchParams.append('ids[]', PYTH_BTC_USD_ID);
//       url.searchParams.append('ids[]', PYTH_ETH_USD_ID);
//       // Optional: Add _encoding=base64 if preferred, default is binary hex

//       console.log('Connecting to Pyth price stream:', url.toString());
//       eventSource = new EventSource(url.toString());

//       eventSource.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           // console.log("Raw SSE data received:", data); // For debugging

//           if (data.parsed && Array.isArray(data.parsed)) {
//             let newBtcPrice = null;
//             let newEthPrice = null;

//             for (const feed of data.parsed) {
//               if (feed.id === PYTH_BTC_USD_ID && feed.price) {
//                 newBtcPrice =
//                   parseFloat(feed.price.price) * Math.pow(10, feed.price.expo);
//               } else if (feed.id === PYTH_ETH_USD_ID && feed.price) {
//                 newEthPrice =
//                   parseFloat(feed.price.price) * Math.pow(10, feed.price.expo);
//               }
//             }

//             if (newBtcPrice !== null && newEthPrice !== null && isMounted) {
//               setPrices({ btcPrice: newBtcPrice, ethPrice: newEthPrice });
//               if (initialLoad) {
//                 setLoading(false);
//                 initialLoad = false;
//               }
//               // console.log(`Streamed Prices - BTC: $${newBtcPrice.toFixed(2)}, ETH: $${newEthPrice.toFixed(2)}`);
//             }
//           }
//         } catch (err) {
//           console.error(
//             'Error processing SSE message:',
//             err,
//             'Raw data:',
//             event.data
//           );
//           if (isMounted) {
//             setError(`Error parsing data: ${err.message}`);
//           }
//         }
//       };

//       eventSource.onerror = (err) => {
//         console.error('Pyth SSE Error:', err);
//         if (isMounted) {
//           // Check if it's a connection error or just a closure
//           if (err.eventPhase === EventSource.CLOSED) {
//             console.log('SSE connection closed. Attempting to reconnect...');
//             // Optional: Add a small delay before reconnecting
//             setTimeout(connect, 1000); // Reconnect after 1 second
//           } else {
//             setError(`SSE Error: ${err.message || 'Connection failed'}`);
//             setLoading(false); // Stop loading on error
//           }
//         }
//       };

//       eventSource.onopen = () => {
//         console.log('Pyth SSE connection opened.');
//         if (isMounted && initialLoad) {
//           // Reset error if connection is successful
//           setError(null);
//           // Loading will be set to false on first message
//         }
//       };
//     };

//     connect(); // Initiate the connection

//     // Cleanup function
//     return () => {
//       isMounted = false;
//       if (eventSource) {
//         eventSource.close();
//         console.log('Pyth SSE connection closed by cleanup.');
//       }
//     };
//   }, [enabled]); // Re-run effect if 'enabled' changes

//   return { ...prices, loading, error };
// };
