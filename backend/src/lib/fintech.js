/**
 * Stub adapter shaped like a real momo aggregator (e.g. Fapshi/CamPay/PawaPay).
 * Swap the body of `initiateCollection` for a real HTTP call once credentials exist —
 * callers only depend on { reference, status } either way.
 */
async function initiateCollection({ provider, amountXAF, phone, reference }) {
  if (!["MTN", "ORANGE"].includes(provider)) {
    throw new Error("Unsupported provider");
  }
  if (!/^6[0-9]{8}$/.test(phone)) {
    throw new Error("Invalid Cameroon phone number");
  }

  // Real aggregators return PENDING immediately then confirm async via webhook.
  return { reference, status: "PENDING", provider, amountXAF };
}

module.exports = { initiateCollection };
