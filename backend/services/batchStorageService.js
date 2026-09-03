const fs = require("fs");
const path = require("path");

const storageDirectory = path.join(__dirname, "../storage");
const batchesFilePath = path.join(storageDirectory, "batches.json");

// ==========================================
// CREATE STORAGE FILE IF IT DOES NOT EXIST
// ==========================================

function ensureStorageExists() {
  if (!fs.existsSync(storageDirectory)) {
    fs.mkdirSync(storageDirectory, {
      recursive: true,
    });
  }

  if (!fs.existsSync(batchesFilePath)) {
    fs.writeFileSync(batchesFilePath, JSON.stringify([], null, 2));
  }
}

// ==========================================
// GET ALL SAVED BATCHES
// ==========================================

function getSavedBatches() {
  ensureStorageExists();

  const data = fs.readFileSync(batchesFilePath, "utf8");

  return JSON.parse(data);
}

// ==========================================
// SAVE A NEW BATCH
// ==========================================

function saveBatch(batch) {
  const batches = getSavedBatches();

  batches.push(batch);

  fs.writeFileSync(batchesFilePath, JSON.stringify(batches, null, 2));

  return batch;
}

// ==========================================
// GET ONE BATCH BY ID
// ==========================================

function getBatchById(batchId) {
  const batches = getSavedBatches();

  return batches.find((batch) => batch.batch_id === batchId);
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  saveBatch,
  getSavedBatches,
  getBatchById,
};
