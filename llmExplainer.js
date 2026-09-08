async function explain(item, risk, forecast, rec) {
  const prompt = buildPrompt(item, risk, forecast, rec);

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 120,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data?.content?.find((b) => b.type === "text")?.text;
      if (text) return text.trim();
    } catch (err) {
    }
  }

  return templateFallback(item, risk, forecast, rec);
}

function buildPrompt(item, risk, forecast, rec) {
  return [
    `Hub ops alert. Write one short, direct sentence (under 25 words) telling`,
    `the ops team exactly what to do. No preamble.`,
    ``,
    `SKU: ${item.sku} at ${item.hub}`,
    `Stock: ${item.unitsInStock} units, ${risk.remainingDays} days of shelf life left (${risk.level} risk)`,
    `Demand forecast: ${forecast.projectedDemand} units over next ${forecast.daysAhead} days, trend ${forecast.trendDirection}`,
    `Recommended action code: ${rec.action}, surplus: ${rec.surplusUnits} units`,
  ].join("\n");
}

function templateFallback(item, risk, forecast, rec) {
  const templates = {
    "write-off-review": `${item.sku} at ${item.hub} is past shelf life - pull ${item.unitsInStock} units for write-off review today.`,
    "reallocate-to-higher-demand-hub": `${item.sku} at ${item.hub}: ${risk.remainingDays}d left, demand is ${forecast.trendDirection}, ~${rec.surplusUnits} units won't sell in time - reallocate to a hub with stronger demand now.`,
    "discount-to-clear": `${item.sku} at ${item.hub}: ${risk.remainingDays}d left with ~${rec.surplusUnits} units of surplus - apply a clearance discount today to move stock before spoilage.`,
    "monitor-closely": `${item.sku} at ${item.hub} is high spoilage risk but demand looks sufficient - recheck in 24h, no action yet.`,
    "flag-for-review": `${item.sku} at ${item.hub} has moderate surplus risk (${rec.surplusUnits} units) - flag for procurement review before next reorder.`,
    hold: `${item.sku} at ${item.hub} is tracking normally - no action needed.`,
  };
  return templates[rec.action] || `${item.sku} at ${item.hub}: review recommended (${rec.action}).`;
}

module.exports = { explain };
