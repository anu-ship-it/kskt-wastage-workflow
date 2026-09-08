function scoreSpoilageRisk(item) {
  const remainingDays = item.shelfLifeDays - item.daysInStock;
  const lifeUsedFraction = item.daysInStock / item.shelfLifeDays;

  let level;
  if (remainingDays <= 0) level = "expired";
  else if (lifeUsedFraction >= 0.75) level = "high";
  else if (lifeUsedFraction >= 0.5) level = "medium";
  else level = "low";

  return {
    remainingDays,
    lifeUsedFraction: Number(lifeUsedFraction.toFixed(2)),
    level,
  };
}

module.exports = { scoreSpoilageRisk };