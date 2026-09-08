function forecastDemand(salesHistory, daysAhead = 3) {
  const n = salesHistory.length;
  const weights = salesHistory.map((_, i) => i + 1); // later days weighted more
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const weightedAvgDaily =
    salesHistory.reduce((sum, units, i) => sum + units * weights[i], 0) /
    weightSum;

  const firstHalf = salesHistory.slice(0, Math.floor(n / 2));
  const secondHalf = salesHistory.slice(Math.floor(n / 2));
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const trendPct =
    ((avg(secondHalf) - avg(firstHalf)) / (avg(firstHalf) || 1)) * 100;

  return {
    avgDailyDemand: Number(weightedAvgDaily.toFixed(1)),
    projectedDemand: Number((weightedAvgDaily * daysAhead).toFixed(1)),
    trendPct: Number(trendPct.toFixed(1)),
    trendDirection: trendPct < -10 ? "falling" : trendPct > 10 ? "rising" : "flat",
    daysAhead,
  };
}

module.exports = { forecastDemand };