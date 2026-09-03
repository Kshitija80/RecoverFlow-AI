function executeRecovery(payment, policyDecision) {
  const timestamp = new Date().toISOString();

  // Default audit record
  const audit = {
    payment_id: payment.payment_id,
    amount: payment.amount,
    requested_action: policyDecision.action,
    policy_decision: policyDecision.decision,
    policy_reason: policyDecision.reason,
    executed: false,
    outcome: null,
    recovered_amount: 0,
    timestamp,
  };

  // If policy blocks the action
  if (policyDecision.decision === "BLOCK") {
    return {
      ...audit,
      outcome: "blocked",
    };
  }

  // If human review is required
  if (policyDecision.decision === "ESCALATE") {
    return {
      ...audit,
      outcome: "escalated",
    };
  }

  // If approved but intentionally no action
  if (policyDecision.action === "no_action") {
    return {
      ...audit,
      executed: true,
      outcome: "no_action",
    };
  }

  // Simulated recovery rules
  let recoverySuccessful = false;

  if (policyDecision.action === "retry_payment") {
    // Retry is more likely to work for temporary failures
    recoverySuccessful =
      payment.failure_reason === "network_timeout" ||
      payment.failure_reason === "technical_error";
  }

  if (policyDecision.action === "send_recovery_link") {
    // Simulate a customer completing recovery
    recoverySuccessful = payment.customer_previous_successful_payments >= 2;
  }

  // Recovery succeeded
  if (recoverySuccessful) {
    return {
      ...audit,
      executed: true,
      outcome: "recovered",
      recovered_amount: payment.amount,
    };
  }

  // Recovery did not succeed
  return {
    ...audit,
    executed: true,
    outcome: "not_recovered",
    recovered_amount: 0,
  };
}

module.exports = {
  executeRecovery,
};
