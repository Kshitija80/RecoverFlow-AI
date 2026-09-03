const ALLOWED_ACTIONS = [
  "retry_payment",
  "send_recovery_link",
  "no_action",
  "escalate",
];

const MAX_RETRY_COUNT = 2;
const MIN_CONFIDENCE = 0.6;

function evaluateRecoveryPolicy(payment, diagnosis) {
  // Rule 1: Only failed payments can enter recovery
  if (payment.status !== "failed") {
    return {
      decision: "BLOCK",
      action: "no_action",
      reason: "Payment is not in failed status",
    };
  }

  // Rule 2: Prevent duplicate recovery attempts
  if (payment.recovery_attempted === true) {
    return {
      decision: "BLOCK",
      action: "no_action",
      reason: "Recovery has already been attempted for this payment",
    };
  }

  // Rule 3: Check that AI returned an allowed action
  if (!ALLOWED_ACTIONS.includes(diagnosis.recommended_action)) {
    return {
      decision: "BLOCK",
      action: "no_action",
      reason: "AI recommended an unsupported action",
    };
  }

  // Rule 4: Low confidence should go to escalation
  if (diagnosis.confidence < MIN_CONFIDENCE) {
    return {
      decision: "ESCALATE",
      action: "escalate",
      reason: `AI confidence ${diagnosis.confidence} is below minimum threshold ${MIN_CONFIDENCE}`,
    };
  }

  // Rule 5: Retry stopping rule
  if (
    diagnosis.recommended_action === "retry_payment" &&
    payment.retry_count >= MAX_RETRY_COUNT
  ) {
    return {
      decision: "BLOCK",
      action: "no_action",
      reason: `Maximum retry limit of ${MAX_RETRY_COUNT} reached`,
    };
  }

  // AI itself recommends no action
  if (diagnosis.recommended_action === "no_action") {
    return {
      decision: "APPROVE",
      action: "no_action",
      reason: "AI determined that no recovery action should be taken",
    };
  }

  // AI requests escalation
  if (diagnosis.recommended_action === "escalate") {
    return {
      decision: "ESCALATE",
      action: "escalate",
      reason: "AI recommended human review",
    };
  }

  // Safe action approved
  return {
    decision: "APPROVE",
    action: diagnosis.recommended_action,
    reason: "Recovery action passed all safety policy checks",
  };
}

module.exports = {
  evaluateRecoveryPolicy,
  ALLOWED_ACTIONS,
  MAX_RETRY_COUNT,
  MIN_CONFIDENCE,
};
