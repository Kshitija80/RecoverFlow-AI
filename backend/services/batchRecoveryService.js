const fs = require("fs");
const path = require("path");

const {
  diagnosePayment,
  fallbackDiagnosePayment,
} = require("../agents/diagnosisAgent");

const { evaluateRecoveryPolicy } = require("../policies/recoveryPolicy");
const { executeRecovery } = require("../executors/recoveryExecutor");

// ==========================================
// CONFIGURATION
// ==========================================

// Maximum number of Gemini API calls allowed in one batch.
// This prevents unnecessary quota exhaustion.
const MAX_AI_CALLS_PER_BATCH = 5;

// Storage folder for completed batch results
const STORAGE_FOLDER = path.join(__dirname, "../storage");

// File where batch history will be saved
const BATCHES_FILE = path.join(STORAGE_FOLDER, "batches.json");

// ==========================================
// SAVE BATCH RESULT
// ==========================================

function saveBatch(batchData) {
  try {
    // Create storage folder automatically if it does not exist
    if (!fs.existsSync(STORAGE_FOLDER)) {
      fs.mkdirSync(STORAGE_FOLDER, {
        recursive: true,
      });
    }

    let existingBatches = [];

    // Read existing batches if the file already exists
    if (fs.existsSync(BATCHES_FILE)) {
      const fileData = fs.readFileSync(BATCHES_FILE, "utf-8");

      if (fileData.trim()) {
        existingBatches = JSON.parse(fileData);
      }
    }

    // Add the new batch
    existingBatches.push(batchData);

    // Save all batches
    fs.writeFileSync(
      BATCHES_FILE,
      JSON.stringify(existingBatches, null, 2),
      "utf-8",
    );

    return true;
  } catch (error) {
    console.error("Failed to save batch:", error.message);

    throw error;
  }
}

// ==========================================
// RUN BATCH RECOVERY
// ==========================================

async function runBatchRecovery(payments) {
  const failedPayments = payments.filter(
    (payment) => payment.status === "failed",
  );

  const auditTrail = [];

  let totalRevenueAtRisk = 0;
  let totalRecoveredAmount = 0;
  let recoveredPayments = 0;
  let notRecoveredPayments = 0;
  let blockedPayments = 0;
  let escalatedPayments = 0;
  let aiFailures = 0;
  let aiCallsUsed = 0;
  let fallbackUsed = 0;

  // ==========================================
  // PROCESS EVERY FAILED PAYMENT
  // ==========================================

  for (const payment of failedPayments) {
    totalRevenueAtRisk += payment.amount;

    let diagnosis;
    let diagnosisSource;

    // ==========================================
    // STEP 1: CONTROLLED AI DIAGNOSIS
    // ==========================================

    if (aiCallsUsed < MAX_AI_CALLS_PER_BATCH) {
      aiCallsUsed++;

      const diagnosisResult = await diagnosePayment(payment);

      if (diagnosisResult.success) {
        diagnosis = diagnosisResult.data;
        diagnosisSource = "gemini_ai";
      } else {
        // Gemini failed -> safely switch to fallback
        aiFailures++;
        fallbackUsed++;

        diagnosis = fallbackDiagnosePayment(payment);
        diagnosisSource = "deterministic_fallback";
      }
    } else {
      // AI call limit reached -> use deterministic fallback
      fallbackUsed++;

      diagnosis = fallbackDiagnosePayment(payment);
      diagnosisSource = "deterministic_fallback";
    }

    // ==========================================
    // STEP 2: SAFETY POLICY
    // ==========================================

    const policyDecision = evaluateRecoveryPolicy(payment, diagnosis);

    // ==========================================
    // STEP 3: EXECUTE ONLY POLICY-APPROVED ACTION
    // ==========================================

    const executionResult = executeRecovery(payment, policyDecision);

    // ==========================================
    // STEP 4: UPDATE METRICS
    // ==========================================

    if (executionResult.outcome === "recovered") {
      recoveredPayments++;
      totalRecoveredAmount += executionResult.recovered_amount;
    } else if (executionResult.outcome === "not_recovered") {
      notRecoveredPayments++;
    } else if (executionResult.outcome === "blocked") {
      blockedPayments++;
    } else if (executionResult.outcome === "escalated") {
      escalatedPayments++;
    }

    // ==========================================
    // STEP 5: CREATE AUDIT TRAIL RECORD
    // ==========================================

    auditTrail.push({
      payment_id: payment.payment_id,
      amount: payment.amount,
      diagnosis_source: diagnosisSource,
      diagnosis,
      policy_decision: policyDecision,
      execution: executionResult,
      processed_at: new Date().toISOString(),
    });
  }

  // ==========================================
  // FINAL METRICS
  // ==========================================

  const recoveryRate =
    failedPayments.length > 0
      ? Number(((recoveredPayments / failedPayments.length) * 100).toFixed(2))
      : 0;

  const moneyRecoveryRate =
    totalRevenueAtRisk > 0
      ? Number(((totalRecoveredAmount / totalRevenueAtRisk) * 100).toFixed(2))
      : 0;

  // ==========================================
  // CREATE COMPLETE BATCH RECORD
  // ==========================================

  const batchData = {
    batch_id: `batch_${Date.now()}`,
    created_at: new Date().toISOString(),

    summary: {
      total_failed_payments: failedPayments.length,
      revenue_at_risk: totalRevenueAtRisk,

      recovered_payments: recoveredPayments,
      recovered_amount: totalRecoveredAmount,
      recovery_rate_percent: recoveryRate,
      money_recovery_rate_percent: moneyRecoveryRate,

      not_recovered_payments: notRecoveredPayments,
      blocked_payments: blockedPayments,
      escalated_payments: escalatedPayments,

      ai_calls_used: aiCallsUsed,
      ai_failures: aiFailures,
      fallback_used: fallbackUsed,
    },

    audit_trail: auditTrail,
  };

  // ==========================================
  // STEP 6: SAVE BATCH TO FILE
  // ==========================================

  saveBatch(batchData);

  // Return complete batch result
  return batchData;
}

module.exports = {
  runBatchRecovery,
};
