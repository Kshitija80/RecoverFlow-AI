const fs = require("fs");
const path = require("path");

const paymentsFilePath = path.join(__dirname, "..", "data", "payments.json");

function getAllPayments() {
  const data = fs.readFileSync(paymentsFilePath, "utf-8");

  return JSON.parse(data);
}

function getPaymentStats() {
  const payments = getAllPayments();

  const totalPayments = payments.length;

  const failedPayments = payments.filter(
    (payment) => payment.status === "failed",
  );

  const successfulPayments = payments.filter(
    (payment) => payment.status === "captured",
  );

  const revenueAtRisk = failedPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  return {
    total_payments: totalPayments,
    successful_payments: successfulPayments.length,
    failed_payments: failedPayments.length,
    revenue_at_risk: revenueAtRisk,
  };
}

module.exports = {
  getAllPayments,
  getPaymentStats,
};
