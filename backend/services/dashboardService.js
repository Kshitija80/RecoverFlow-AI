const { getAllPayments, getPaymentStats } = require("./paymentService");

const { getAllRecoveryBatches } = require("./recoveryBatchService");

// ==========================================
// GET DASHBOARD ANALYTICS
// ==========================================

function getDashboardAnalytics() {
  // ------------------------------------------
  // PAYMENT DATA
  // ------------------------------------------

  const payments = getAllPayments();
  const paymentStats = getPaymentStats();

  // ------------------------------------------
  // SAVED RECOVERY BATCHES
  // ------------------------------------------

  const batches = getAllRecoveryBatches();

  // Get the latest saved batch
  const latestBatch = batches.length > 0 ? batches[batches.length - 1] : null;

  // ------------------------------------------
  // DEFAULT RECOVERY METRICS
  // ------------------------------------------

  let recoveryMetrics = {
    total_failed_payments: 0,
    revenue_at_risk: 0,
    recovered_payments: 0,
    recovered_amount: 0,
    recovery_rate_percent: 0,
    money_recovery_rate_percent: 0,
    not_recovered_payments: 0,
    blocked_payments: 0,
    escalated_payments: 0,
    ai_calls_used: 0,
    ai_failures: 0,
    fallback_used: 0,
  };

  // Use recovery metrics from the latest batch
  if (latestBatch && latestBatch.summary) {
    recoveryMetrics = latestBatch.summary;
  }

  // ------------------------------------------
  // RETURN DASHBOARD DATA
  // ------------------------------------------

  return {
    overview: {
      total_payments: paymentStats.total_payments,
      successful_payments: paymentStats.successful_payments,
      failed_payments: paymentStats.failed_payments,
      revenue_at_risk: paymentStats.revenue_at_risk,
    },

    payment_statistics: paymentStats,

    recovery_metrics: recoveryMetrics,

    latest_batch: latestBatch
      ? {
          batch_id: latestBatch.batch_id,
          created_at: latestBatch.created_at,
        }
      : null,

    total_saved_batches: batches.length,

    generated_at: new Date().toISOString(),
  };
}

module.exports = {
  getDashboardAnalytics,
};
