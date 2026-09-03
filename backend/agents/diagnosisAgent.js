const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ==========================================
// DETERMINISTIC FALLBACK DIAGNOSIS
// Used when Gemini AI is unavailable
// ==========================================

function fallbackDiagnosePayment(payment) {
  let diagnosis = "unknown";
  let confidence = 0.7;
  let recommended_action = "escalate";
  let explanation =
    "Automatic fallback could not confidently determine the failure cause.";

  switch (payment.failure_reason) {
    case "network_timeout":
    case "technical_error":
      diagnosis = "transient_technical_failure";
      confidence = 0.95;
      recommended_action = "retry_payment";
      explanation =
        "The failure reason indicates a temporary technical issue. A bounded retry may be appropriate.";
      break;

    case "insufficient_funds":
      diagnosis = "insufficient_funds";
      confidence = 0.95;
      recommended_action = "send_recovery_link";
      explanation =
        "The payment failed because of insufficient funds. Retrying immediately may not help, so a recovery link is recommended.";
      break;

    case "customer_abandoned":
      diagnosis = "customer_abandoned";
      confidence = 0.95;
      recommended_action = "send_recovery_link";
      explanation =
        "The customer did not complete checkout. A recovery link can be used to allow the customer to complete the payment later.";
      break;

    case "bank_declined":
      diagnosis = "bank_declined";
      confidence = 0.9;
      recommended_action = "send_recovery_link";
      explanation =
        "The bank declined the payment. A recovery link can offer the customer another opportunity to pay.";
      break;

    case "authentication_issue":
      diagnosis = "authentication_issue";
      confidence = 0.9;
      recommended_action = "send_recovery_link";
      explanation =
        "The payment failed because authentication was not completed. The customer should be allowed to retry through a secure recovery flow.";
      break;

    default:
      break;
  }

  return {
    diagnosis,
    confidence,
    recommended_action,
    explanation,
    diagnosis_source: "deterministic_fallback",
  };
}

// ==========================================
// GEMINI AI DIAGNOSIS
// ==========================================

async function diagnosePayment(payment) {
  const prompt = `
You are an AI assistant for a payment revenue recovery system.

Analyze this FAILED payment and return ONLY valid JSON.

Payment data:
${JSON.stringify(payment, null, 2)}

Choose exactly one diagnosis from:
- transient_technical_failure
- bank_declined
- insufficient_funds
- authentication_issue
- customer_abandoned
- unknown

Choose exactly one recommended_action from:
- retry_payment
- send_recovery_link
- no_action
- escalate

Rules:
- Use the available payment context.
- Do not invent facts.
- If the information is insufficient, use "unknown".
- AI does NOT have authority to execute a payment action.
- Keep the explanation short and specific.

Return JSON in exactly this format:
{
  "diagnosis": "string",
  "confidence": 0.0,
  "recommended_action": "string",
  "explanation": "string"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);

    return {
      success: true,
      source: "gemini_ai",
      data: {
        ...result,
        diagnosis_source: "gemini_ai",
      },
    };
  } catch (error) {
    console.error("AI diagnosis failed:", error.message);

    return {
      success: false,
      source: "gemini_failed",
      error: "AI_DIAGNOSIS_FAILED",
      message: error.message,
    };
  }
}

module.exports = {
  diagnosePayment,
  fallbackDiagnosePayment,
};
