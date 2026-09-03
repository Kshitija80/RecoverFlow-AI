const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ==========================================
// SERVICES
// ==========================================

const {
  getAllPayments,
  getPaymentStats,
} = require("./services/paymentService");

const { runBatchRecovery } = require("./services/batchRecoveryService");

const {
  saveRecoveryBatch,
  getAllRecoveryBatches,
  getRecoveryBatchById,
} = require("./services/recoveryBatchService");

const { getDashboardAnalytics } = require("./services/dashboardService");

// ==========================================
// AI AGENT
// ==========================================

const {
  diagnosePayment,
  fallbackDiagnosePayment,
} = require("./agents/diagnosisAgent");
// ==========================================
// POLICY
// ==========================================

const { evaluateRecoveryPolicy } = require("./policies/recoveryPolicy");

// ==========================================
// EXECUTOR
// ==========================================

const { executeRecovery } = require("./executors/recoveryExecutor");

// ==========================================
// APP SETUP
// ==========================================

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==========================================
// BASIC HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RecoverFlow AI backend is running",
  });
});

// ==========================================
// GET ALL PAYMENTS
// ==========================================

app.get("/api/payments", (req, res) => {
  try {
    const payments = getAllPayments();

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Get payments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load payment data",
      error: error.message,
    });
  }
});

// ==========================================
// GET PAYMENT STATISTICS
// ==========================================

app.get("/api/payments/stats", (req, res) => {
  try {
    const stats = getPaymentStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Payment statistics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to calculate payment statistics",
      error: error.message,
    });
  }
});

// ==========================================
// AI DIAGNOSIS FOR ONE FAILED PAYMENT
// ==========================================
// ==========================================
// AI DIAGNOSIS FOR ONE FAILED PAYMENT
// WITH DETERMINISTIC FALLBACK
// ==========================================

app.get("/api/payments/:paymentId/diagnose", async (req, res) => {
  try {
    const payments = getAllPayments();

    const payment = payments.find(
      (item) => item.payment_id === req.params.paymentId,
    );

    // Check whether payment exists
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Only failed payments need diagnosis
    if (payment.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Only failed payments can be diagnosed",
      });
    }

    // Try Gemini AI diagnosis first
    const diagnosisResult = await diagnosePayment(payment);

    let diagnosis;
    let diagnosisSource;

    // If Gemini succeeds, use AI result
    if (diagnosisResult.success) {
      diagnosis = diagnosisResult.data;
      diagnosisSource = "gemini_ai";

      console.log(`AI diagnosis successful for payment: ${payment.payment_id}`);
    } else {
      // If Gemini fails, automatically use fallback
      console.log(
        `Gemini unavailable. Using deterministic fallback for payment: ${payment.payment_id}`,
      );

      diagnosis = fallbackDiagnosePayment(payment);
      diagnosisSource = "deterministic_fallback";
    }

    // Always return a successful diagnosis
    res.status(200).json({
      success: true,
      payment,
      diagnosis,
      diagnosis_source: diagnosisSource,
    });
  } catch (error) {
    console.error("Diagnosis error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to diagnose payment",
      error: error.message,
    });
  }
});

// ==========================================
// AI + SAFETY POLICY = RECOVERY PLAN
// ==========================================

// ==========================================
// AI + SAFETY POLICY = RECOVERY PLAN
// WITH DETERMINISTIC FALLBACK
// ==========================================

app.get("/api/payments/:paymentId/recovery-plan", async (req, res) => {
  try {
    const payments = getAllPayments();

    const payment = payments.find(
      (item) => item.payment_id === req.params.paymentId,
    );

    // Check whether payment exists
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Only failed payments need a recovery plan
    if (payment.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Only failed payments need a recovery plan",
      });
    }

    // Step 1: Try Gemini AI diagnosis
    const diagnosisResult = await diagnosePayment(payment);

    let diagnosis;
    let diagnosisSource;

    // Step 2: Use Gemini if successful
    if (diagnosisResult.success) {
      diagnosis = diagnosisResult.data;
      diagnosisSource = "gemini_ai";

      console.log(
        `Gemini AI diagnosis used for recovery plan: ${payment.payment_id}`,
      );
    } else {
      // Step 3: Use deterministic fallback if Gemini fails
      console.log(
        `Gemini unavailable. Using fallback for recovery plan: ${payment.payment_id}`,
      );

      diagnosis = fallbackDiagnosePayment(payment);
      diagnosisSource = "deterministic_fallback";
    }

    // Step 4: Apply safety policy
    const policyDecision = evaluateRecoveryPolicy(payment, diagnosis);

    // Step 5: Return recovery plan
    res.status(200).json({
      success: true,
      payment_id: payment.payment_id,
      amount: payment.amount,
      diagnosis,
      diagnosis_source: diagnosisSource,
      policy_decision: policyDecision,
    });
  } catch (error) {
    console.error("Recovery plan error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create recovery plan",
      error: error.message,
    });
  }
});

// ==========================================
// EXECUTE RECOVERY FOR ONE PAYMENT
// ==========================================
// ==========================================
// EXECUTE RECOVERY FOR ONE PAYMENT
// WITH DETERMINISTIC FALLBACK
// ==========================================

app.post("/api/payments/:paymentId/recover", async (req, res) => {
  try {
    const payments = getAllPayments();

    const payment = payments.find(
      (item) => item.payment_id === req.params.paymentId,
    );

    // Step 1: Check if payment exists
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Step 2: Only failed payments can enter recovery
    if (payment.status !== "failed") {
      return res.status(400).json({
        success: false,
        message: "Only failed payments can enter recovery",
      });
    }

    // Step 3: Try Gemini AI diagnosis
    const diagnosisResult = await diagnosePayment(payment);

    let diagnosis;
    let diagnosisSource;

    // Step 4: Use Gemini if available
    if (diagnosisResult.success) {
      diagnosis = diagnosisResult.data;
      diagnosisSource = "gemini_ai";

      console.log(
        `Gemini AI diagnosis used for recovery: ${payment.payment_id}`,
      );
    } else {
      // Step 5: Use deterministic fallback if Gemini fails
      console.log(
        `Gemini unavailable. Using fallback for recovery: ${payment.payment_id}`,
      );

      diagnosis = fallbackDiagnosePayment(payment);
      diagnosisSource = "deterministic_fallback";
    }

    // Step 6: Apply deterministic safety policy
    const policyDecision = evaluateRecoveryPolicy(payment, diagnosis);

    // Step 7: Execute ONLY the policy-approved action
    const executionResult = executeRecovery(payment, policyDecision);

    // Step 8: Return complete recovery result
    res.status(200).json({
      success: true,
      payment_id: payment.payment_id,
      diagnosis,
      diagnosis_source: diagnosisSource,
      policy_decision: policyDecision,
      execution: executionResult,
    });
  } catch (error) {
    console.error("Recovery execution error:", error.message);

    res.status(500).json({
      success: false,
      message: "Recovery execution failed",
      error: error.message,
    });
  }
});
// ==========================================
// RUN BATCH RECOVERY AND SAVE BATCH
// ==========================================

app.post("/api/recovery/batch", async (req, res) => {
  try {
    // Get all payments
    const payments = getAllPayments();

    // Run batch recovery
    const batchResult = await runBatchRecovery(payments);

    // Save the complete batch
    const savedBatch = saveRecoveryBatch(batchResult);

    res.json({
      success: true,
      message: "Batch recovery completed and saved",
      batch_id: savedBatch.batch_id,
      created_at: savedBatch.created_at,
      summary: savedBatch.summary,
      audit_trail: savedBatch.audit_trail,
    });
  } catch (error) {
    console.error("Batch recovery error:", error.message);

    res.status(500).json({
      success: false,
      message: "Batch recovery failed",
      error: error.message,
    });
  }
});

// ==========================================
// GET ALL SAVED RECOVERY BATCHES
// IMPORTANT: This route must come before
// /:batchId route
// ==========================================

app.get("/api/recovery/batches", (req, res) => {
  try {
    const batches = getAllRecoveryBatches();

    // Return summary information for every batch
    const batchSummaries = batches.map((batch) => ({
      batch_id: batch.batch_id,
      created_at: batch.created_at,
      summary: batch.summary,
    }));

    res.json({
      success: true,
      count: batchSummaries.length,
      data: batchSummaries,
    });
  } catch (error) {
    console.error("Get batches error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load recovery batches",
      error: error.message,
    });
  }
});

// ==========================================
// GET ONE RECOVERY BATCH BY ID
// ==========================================

app.get("/api/recovery/batches/:batchId", (req, res) => {
  try {
    const batch = getRecoveryBatchById(req.params.batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Recovery batch not found",
      });
    }

    // Return complete batch with audit trail
    res.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error("Get batch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load recovery batch",
      error: error.message,
    });
  }
});

// ==========================================
// STEP 6.2: GET DASHBOARD ANALYTICS
// ==========================================

app.get("/api/dashboard", (req, res) => {
  try {
    const dashboardData = getDashboardAnalytics();

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard analytics",
      error: error.message,
    });
  }
});
// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`RecoverFlow server running on http://localhost:${PORT}`);
});
