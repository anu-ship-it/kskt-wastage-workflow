const items = require("./data");
const { scoreSpoilageRisk } = require("./spoilageRisk");
const { forecastDemand } = require("./demandForecast");
const { recommend } = require("./recommendationEngine");
const { explain } = require("./llmExplainer");

async function run() {
  console.log("KSKT wastage-risk alert workflow — run output\n");

  for (const item of items) {
    const risk = scoreSpoilageRisk(item);
    const forecast = forecastDemand(item.salesHistory);
    const rec = recommend(item, risk, forecast);
    const message = await explain(item, risk, forecast, rec);

    const priority = rec.urgency.toUpperCase();
    console.log(`[${priority}] ${item.sku} — ${item.hub}`);
    console.log(`  risk: ${risk.level} (${risk.remainingDays}d shelf life left)`);
    console.log(`  forecast: ${forecast.projectedDemand} units / ${forecast.daysAhead}d, trend ${forecast.trendDirection}`);
    console.log(`  action: ${rec.action}`);
    console.log(`  alert: ${message}`);
    console.log("");
  }
}

run();
