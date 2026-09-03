const fs = require("fs");
const path = require("path");

const paymentMethods = ["UPI", "Card", "NetBanking", "Wallet"];

const failureReasons = [
  "network_timeout",
  "bank_declined",
  "insufficient_funds",
  "authentication_failed",
  "technical_error",
  "customer_abandoned",
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomAmount() {
  return Math.floor(Math.random() * 9000) + 500;
}

function randomDate() {
  const start = new Date("2026-08-01").getTime();
  const end = new Date("2026-08-31").getTime();

  const randomTime = start + Math.random() * (end - start);

  return new Date(randomTime).toISOString();
}

const payments = [];

for (let i = 1; i <= 120; i++) {
  const isFailed = Math.random() < 0.4;

  const payment = {
    payment_id: `pay_${String(i).padStart(4, "0")}`,
    amount: randomAmount(),
    currency: "INR",
    payment_method: randomItem(paymentMethods),

    status: isFailed ? "failed" : "captured",

    failure_reason: isFailed ? randomItem(failureReasons) : null,

    customer_previous_successful_payments: Math.floor(Math.random() * 6),

    retry_count: isFailed ? Math.floor(Math.random() * 4) : 0,

    recovery_attempted: false,

    recovery_status: "not_attempted",

    created_at: randomDate(),
  };

  payments.push(payment);
}

const outputPath = path.join(__dirname, "payments.json");

fs.writeFileSync(outputPath, JSON.stringify(payments, null, 2));

console.log("Successfully generated 120 payment records.");
console.log(`File saved at: ${outputPath}`);
