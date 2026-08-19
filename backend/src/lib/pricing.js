const UNLOCK_FEE_XAF = 1500;
const BASE_SPECIAL_PICKUP_XAF = 2000;

function calculatePickupPrice(date = new Date()) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = date.getHours();

  const isWeekend = day === 0 || day === 6;
  const isEvening = hour >= 18 || hour < 6;

  let multiplier = 1;
  let surcharges = [];

  if (isWeekend) {
    multiplier += 0.5;
    surcharges.push({ label: "Weekend surcharge", percent: 50 });
  }
  if (isEvening) {
    multiplier += 0.3;
    surcharges.push({ label: "Evening surcharge", percent: 30 });
  }

  const priceXAF = Math.round(BASE_SPECIAL_PICKUP_XAF * multiplier);

  return { priceXAF, isWeekend, isEvening, multiplier, surcharges, basePriceXAF: BASE_SPECIAL_PICKUP_XAF };
}

module.exports = { calculatePickupPrice, UNLOCK_FEE_XAF, BASE_SPECIAL_PICKUP_XAF };
