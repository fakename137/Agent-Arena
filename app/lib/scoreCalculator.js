// src/utils/scoreCalculator.js
export const calculateHybridScore = (
  startPrices,
  currentPrices,
  btcTxPerMin,
  ethTxPerMin
) => {
  // Placeholder for Tx Volume logic if not ready
  const useTxVolume = btcTxPerMin !== undefined && ethTxPerMin !== undefined;

  const btcPriceChange =
    (currentPrices.btcPrice - startPrices.btcPrice) / startPrices.btcPrice;
  const ethPriceChange =
    (currentPrices.ethPrice - startPrices.ethPrice) / startPrices.ethPrice;

  // Avoid division by zero if both changes are zero
  const totalAbsChange = Math.abs(btcPriceChange) + Math.abs(ethPriceChange);
  let priceRatioBTC = 0.5;
  if (totalAbsChange > 0) {
    priceRatioBTC = Math.abs(btcPriceChange) / totalAbsChange;
  }

  let txRatioBTC = 0.5; // Default if Tx data not used
  if (useTxVolume) {
    const totalTx = btcTxPerMin + ethTxPerMin;
    if (totalTx > 0) {
      txRatioBTC = btcTxPerMin / totalTx;
    }
  }

  // Weights (adjust as needed, e.g., 0.6 price, 0.4 tx if Tx is ready)
  const priceWeight = useTxVolume ? 0.6 : 1.0;
  const txWeight = useTxVolume ? 0.4 : 0.0;

  const btcScore = (priceRatioBTC * priceWeight + txRatioBTC * txWeight) * 10;
  const ethScore = 10 - btcScore; // Or calculate similarly

  const intensity = Math.abs(btcScore - ethScore);
  let winner = 'TIE';
  if (btcScore > ethScore) winner = 'BTC';
  else if (ethScore > btcScore) winner = 'ETH';

  return {
    btc: Math.max(0, Math.min(10, btcScore)),
    eth: Math.max(0, Math.min(10, ethScore)),
    intensity,
    winner,
  };
};
