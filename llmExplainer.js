
const GEMINI_MODEL = "gemini-2.0-flash";

async function explain(item, risk, forecast, rec) {
  const prompt = buildPrompt(item, risk, forecast, rec);

  if (process.env.GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120 },
        }),
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err) {
      console.error("Error generating LLM explanation:", err);
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
