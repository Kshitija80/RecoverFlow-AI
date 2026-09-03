const fs = require("fs");
const path = require("path");

const batchesFilePath = path.join(__dirname, "../data/recoveryBatches.json");

// ==========================================
// ENSURE BATCH STORAGE FILE EXISTS
// ==========================================

function ensureBatchesFileExists() {
  if (!fs.existsSync(batchesFilePath)) {
    fs.writeFileSync(batchesFilePath, JSON.stringify([], null, 2), "utf8");
  }
}

// ==========================================
// GET ALL SAVED BATCHES
// ==========================================

function getAllRecoveryBatches() {
  ensureBatchesFileExists();

  const fileData = fs.readFileSync(batchesFilePath, "utf8");

  return JSON.parse(fileData);
}

// ==========================================
// SAVE A NEW RECOVERY BATCH
// ==========================================

function saveRecoveryBatch(batchResult) {
  ensureBatchesFileExists();

  const existingBatches = getAllRecoveryBatches();

  const batchId = `batch_${Date.now()}`;

  const newBatch = {
    batch_id: batchId,
    created_at: new Date().toISOString(),
    summary: batchResult.summary,
    audit_trail: batchResult.audit_trail,
  };

  existingBatches.unshift(newBatch);

  fs.writeFileSync(
    batchesFilePath,
    JSON.stringify(existingBatches, null, 2),
    "utf8",
  );

  return newBatch;
}

// ==========================================
// GET ONE BATCH BY ID
// ==========================================

function getRecoveryBatchById(batchId) {
  const batches = getAllRecoveryBatches();

  return batches.find((batch) => batch.batch_id === batchId);
}

module.exports = {
  saveRecoveryBatch,
  getAllRecoveryBatches,
  getRecoveryBatchById,
};
