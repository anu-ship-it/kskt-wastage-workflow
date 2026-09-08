function recommend(item, risk, forecast) {
  const surplusUnits = item.unitsInStock - forecast.projectedDemand;
  const surplusRatio = surplusUnits / item.unitsInStock;

  let action = "hold";
  let urgency = "none";

  if (risk.level === "expired") {
    action = "write-off-review";
    urgency = "immediate";
  } else if (risk.level === "high" && surplusRatio > 0.3) {
    action = forecast.trendDirection === "falling"
      ? "reallocate-to-higher-demand-hub"
      : "discount-to-clear";
    urgency = "high";
  } else if (risk.level === "high") {
    action = "monitor-closely";
    urgency = "medium";
  } else if (risk.level === "medium" && surplusRatio > 0.4) {
    action = "flag-for-review";
    urgency = "low";
  }

  return {
    action,
    urgency,
    surplusUnits: Math.round(surplusUnits),
    surplusRatio: Number(surplusRatio.toFixed(2)),
  };
}

module.exports = { recommend };