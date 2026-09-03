import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

function App() {
  // ==========================================
  // STATE
  // ==========================================

  const [dashboard, setDashboard] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningRecovery, setRunningRecovery] = useState(false);
  const [error, setError] = useState("");

  // NEW:
  // Professional success message after batch completes
  const [successMessage, setSuccessMessage] = useState("");

  // ==========================================
  // FETCH DASHBOARD
  // ==========================================

  const fetchDashboard = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_BASE_URL}/api/dashboard`);

      if (!response.ok) {
        throw new Error("Unable to connect to the RecoverFlow backend");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load dashboard");
      }

      setDashboard(result.data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.message ||
          "Unable to connect to the RecoverFlow backend. Make sure the backend server is running.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // FETCH BATCH HISTORY
  // ==========================================

  const fetchBatches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recovery/batches`);

      if (!response.ok) {
        throw new Error("Failed to load recovery batches");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load recovery batches");
      }

      setBatches(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Batch history error:", error);

      // Dashboard should still work even if batch history fails
      setBatches([]);
    }
  };

  // ==========================================
  // RUN RECOVERY BATCH
  // ==========================================

  const runRecoveryBatch = async () => {
    let timeoutId;

    try {
      // Show running state
      setRunningRecovery(true);

      // Clear previous error and success message
      setError("");
      setSuccessMessage("");

      console.log("Starting recovery batch...");

      const controller = new AbortController();

      // Stop request after 30 seconds
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);

      const response = await fetch(`${API_BASE_URL}/api/recovery/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      console.log("Recovery response:", result);

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to run recovery batch");
      }

      console.log("Recovery batch completed successfully!");

      // Refresh BOTH dashboard and batch history
      await Promise.all([fetchDashboard(true), fetchBatches()]);

      // ==========================================
      // PROFESSIONAL SUCCESS MESSAGE
      // ==========================================

      setSuccessMessage({
        title: "Recovery batch completed successfully",
        batchId: result.batch_id || "Created successfully",
      });
    } catch (error) {
      console.error("Recovery batch error:", error);

      if (error.name === "AbortError") {
        setError(
          "Recovery batch took more than 30 seconds. Please check the backend terminal.",
        );
      } else {
        setError(
          error.message ||
            "Unable to run the recovery batch. Please check the backend.",
        );
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Enable button again
      setRunningRecovery(false);
    }
  };

  // ==========================================
  // LOAD INITIAL DATA
  // ==========================================

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchDashboard(), fetchBatches()]);
    };

    loadInitialData();
  }, []);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "Not available";
    }

    return formattedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  // ==========================================
  // SAFE PERCENTAGE
  // ==========================================

  const getPercentage = (value) => {
    const number = Number(value) || 0;

    return Math.min(Math.max(number, 0), 100);
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="app center-screen">
        <div className="loading-card">
          <div className="loader"></div>

          <h2>⏳ Loading RecoverFlow dashboard...</h2>

          <p>Fetching payment, recovery, AI, and safety information...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // CONNECTION ERROR
  // ==========================================

  if (error && !dashboard) {
    return (
      <div className="app center-screen">
        <div className="error-message">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Dashboard</h2>

          <p>{error}</p>

          <button
            className="refresh-button"
            onClick={async () => {
              await Promise.all([fetchDashboard(), fetchBatches()]);
            }}
          >
            ↻ Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // NO DATA
  // ==========================================

  if (!dashboard) {
    return (
      <div className="app center-screen">
        <div className="no-data">📭 No dashboard data available yet.</div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const overview = dashboard.overview || {};
  const paymentStats = dashboard.payment_statistics || {};
  const recovery = dashboard.recovery_metrics || {};
  const latestBatch = dashboard.latest_batch;

  const totalPayments =
    Number(paymentStats.total_payments) || Number(overview.total_payments) || 0;

  const successfulPayments = Number(paymentStats.successful_payments) || 0;

  const failedPayments = Number(paymentStats.failed_payments) || 0;

  const recoveredPayments = Number(recovery.recovered_payments) || 0;

  const notRecoveredPayments = Number(recovery.not_recovered_payments) || 0;

  const aiCalls = Number(recovery.ai_calls_used) || 0;

  const aiFailures = Number(recovery.ai_failures) || 0;

  const fallbackDecisions = Number(recovery.fallback_used) || 0;

  const blockedActions = Number(recovery.blocked_payments) || 0;

  const escalatedCases = Number(recovery.escalated_payments) || 0;

  const recoveryRate = getPercentage(recovery.recovery_rate_percent);

  const moneyRecoveryRate = getPercentage(recovery.money_recovery_rate_percent);

  const failedPaymentRate =
    totalPayments > 0
      ? ((failedPayments / totalPayments) * 100).toFixed(2)
      : "0.00";

  const aiReliability =
    aiCalls > 0
      ? (((aiCalls - aiFailures) / aiCalls) * 100).toFixed(2)
      : "100.00";

  const recoveryStatus =
    recoveryRate >= 70
      ? "Excellent"
      : recoveryRate >= 40
        ? "Good"
        : "Needs Improvement";

  // ==========================================
  // LATEST 5 BATCHES
  // Sort by newest created_at first
  // ==========================================

  const latestFiveBatches = [...batches]
    .sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    })
    .slice(0, 5);

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="app">
      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="dashboard-header">
        <div className="brand-icon">⚡</div>

        <h1>RecoverFlow AI</h1>

        <p className="subtitle">
          AI-powered payment failure detection and revenue recovery
        </p>

        <div className="status active">
          <span className="status-dot"></span>
          System Active
        </div>

        <h2>Revenue Recovery Dashboard</h2>

        <p className="dashboard-description">
          Monitor failed payments, recovery performance, AI decisions, and
          safety controls.
        </p>

        <div className="last-updated">
          <span>Last updated:</span>
          <strong>{formatDate(dashboard.generated_at)}</strong>
        </div>

        {/* ACTION BUTTONS */}

        <div className="action-buttons">
          <button
            className="refresh-button"
            disabled={refreshing || runningRecovery}
            onClick={async () => {
              setSuccessMessage("");

              await Promise.all([fetchDashboard(true), fetchBatches()]);
            }}
          >
            {refreshing ? "⏳ Refreshing..." : "↻ Refresh Data"}
          </button>

          <button
            className="batch-button"
            onClick={runRecoveryBatch}
            disabled={runningRecovery || refreshing}
          >
            {runningRecovery
              ? "⏳ Running Recovery..."
              : "▶ Run New Recovery Batch"}
          </button>
        </div>
      </header>

      {/* ==========================================
          SUCCESS MESSAGE
      ========================================== */}

      {successMessage && (
        <div className="success-banner">
          <div className="success-content">
            <div className="success-icon">✅</div>

            <div>
              <h3>{successMessage.title}</h3>

              <p>
                <strong>Batch ID:</strong> {successMessage.batchId}
              </p>
            </div>
          </div>

          <button
            className="close-success-button"
            onClick={() => setSuccessMessage("")}
            aria-label="Close success message"
          >
            ×
          </button>
        </div>
      )}

      {/* ==========================================
          ERROR BANNER
      ========================================== */}

      {error && (
        <div className="inline-error">
          <span>⚠️</span>

          <span>{error}</span>

          <button
            className="close-error-button"
            onClick={() => setError("")}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      <main className="dashboard-container">
        {/* ==========================================
            TOP METRIC CARDS
        ========================================== */}

        <section className="stats-grid">
          {/* TOTAL PAYMENTS */}

          <div className="stat-card">
            <div className="card-icon icon-blue">💳</div>

            <h3>Total Payments</h3>

            <p className="value">{totalPayments}</p>

            <p className="description">Payment records analyzed</p>
          </div>

          {/* REVENUE AT RISK */}

          <div className="stat-card">
            <div className="card-icon icon-red">⚠️</div>

            <h3>Revenue At Risk</h3>

            <p className="value value-danger">
              {formatCurrency(overview.revenue_at_risk)}
            </p>

            <p className="description">From failed payments</p>
          </div>

          {/* RECOVERED AMOUNT */}

          <div className="stat-card">
            <div className="card-icon icon-green">💰</div>

            <h3>Recovered Amount</h3>

            <p className="value value-success">
              {formatCurrency(recovery.recovered_amount)}
            </p>

            <p className="description">Revenue successfully recovered</p>
          </div>

          {/* RECOVERY RATE */}

          <div className="stat-card">
            <div className="card-icon icon-purple">📈</div>

            <h3>Recovery Rate</h3>

            <p className="value value-info">{recoveryRate.toFixed(2)}%</p>

            <p className="description">Failed payments recovered</p>
          </div>
        </section>

        {/* ==========================================
            PAYMENT OVERVIEW
        ========================================== */}

        <section className="dashboard-section">
          <div className="section-title">
            <span className="section-icon">💳</span>

            <h2>Payment Overview</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Successful Payments</span>

              <span className="info-value value-success">
                {successfulPayments}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Failed Payments</span>

              <span className="info-value value-danger">{failedPayments}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Failed Payment Rate</span>

              <span className="info-value value-danger">
                {failedPaymentRate}%
              </span>
            </div>
          </div>
        </section>

        {/* ==========================================
            RECOVERY PERFORMANCE
        ========================================== */}

        <section className="dashboard-section">
          <div className="section-title">
            <span className="section-icon">📈</span>

            <h2>Recovery Performance</h2>
          </div>

          <div className="performance-grid">
            {/* RECOVERY RATE */}

            <div className="performance-card">
              <div className="performance-header">
                <span>Recovery Rate</span>

                <strong className="value-info">
                  {recoveryRate.toFixed(2)}%
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill progress-blue"
                  style={{
                    width: `${recoveryRate}%`,
                  }}
                ></div>
              </div>

              <p>
                {recoveredPayments} recovered out of{" "}
                {recoveredPayments + notRecoveredPayments} recovery attempts
              </p>
            </div>

            {/* MONEY RECOVERY RATE */}

            <div className="performance-card">
              <div className="performance-header">
                <span>Money Recovery Rate</span>

                <strong className="value-success">
                  {moneyRecoveryRate.toFixed(2)}%
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill progress-green"
                  style={{
                    width: `${moneyRecoveryRate}%`,
                  }}
                ></div>
              </div>

              <p>Percentage of revenue successfully recovered</p>
            </div>
          </div>

          <div className="info-grid recovery-stats">
            <div className="info-item">
              <span className="info-label">Recovered Payments</span>

              <span className="info-value value-success">
                {recoveredPayments}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Not Recovered</span>

              <span className="info-value value-warning">
                {notRecoveredPayments}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Recovery Status</span>

              <span className="info-value value-success">{recoveryStatus}</span>
            </div>
          </div>
        </section>

        {/* ==========================================
            AI DECISION ENGINE
        ========================================== */}

        <section className="dashboard-section">
          <div className="section-title">
            <span className="section-icon">🤖</span>

            <h2>AI Decision Engine</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">🤖 AI Calls Used</span>

              <span className="info-value value-info">{aiCalls}</span>
            </div>

            <div className="info-item">
              <span className="info-label">🔄 Fallback Decisions</span>

              <span className="info-value value-warning">
                {fallbackDecisions}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">❌ AI Failures</span>

              <span className="info-value value-success">{aiFailures}</span>
            </div>
          </div>

          <div className="ai-status-card">
            <div className="ai-status-icon">🤖</div>

            <div>
              <h3>AI System Status: Healthy</h3>

              <p>
                {aiCalls} AI-powered decisions completed with {aiFailures} AI
                failures.
                {fallbackDecisions > 0 &&
                  ` ${fallbackDecisions} decisions used the deterministic fallback system when AI was unavailable.`}
              </p>
            </div>

            <div className="reliability-badge">{aiReliability}% Reliable</div>
          </div>
        </section>

        {/* ==========================================
            SAFETY CONTROLS
        ========================================== */}

        <section className="dashboard-section">
          <div className="section-title">
            <span className="section-icon">🛡️</span>

            <h2>Safety Controls</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">🚫 Blocked Actions</span>

              <span className="info-value value-danger">{blockedActions}</span>
            </div>

            <div className="info-item">
              <span className="info-label">⚠️ Escalated Cases</span>

              <span className="info-value value-warning">{escalatedCases}</span>
            </div>

            <div className="info-item">
              <span className="info-label">🛡️ AI Execution Authority</span>

              <span className="info-value">None</span>
            </div>
          </div>
        </section>

        {/* ==========================================
            LATEST RECOVERY BATCH
        ========================================== */}

        <section className="dashboard-section">
          <div className="section-title">
            <span className="section-icon">📦</span>

            <h2>Latest Recovery Batch</h2>
          </div>

          {latestBatch ? (
            <div className="batch-details">
              <div className="batch-item">
                <span>Batch ID</span>

                <strong>{latestBatch.batch_id}</strong>
              </div>

              <div className="batch-item">
                <span>Created At</span>

                <strong>{formatDate(latestBatch.created_at)}</strong>
              </div>

              <div className="batch-item">
                <span>Saved Recovery Batches</span>

                <strong>
                  {dashboard.total_saved_batches || batches.length}
                </strong>
              </div>
            </div>
          ) : (
            <div className="no-data small-no-data">
              📭 No recovery batches available yet. Run a new recovery batch to
              get started.
            </div>
          )}
        </section>

        {/* ==========================================
            RECOVERY BATCH HISTORY
            LATEST 5 BATCHES ONLY
        ========================================== */}

        <section className="dashboard-section batch-history-section">
          <div className="section-title">
            <span className="section-icon">🗂️</span>

            <div>
              <h2>Recovery Batch History</h2>

              <p className="section-subtitle">
                Showing the latest 5 recovery batches
              </p>
            </div>
          </div>

          {latestFiveBatches.length > 0 ? (
            <div className="batch-history-grid">
              {latestFiveBatches.map((batch) => {
                const batchRecoveryRate = Number(
                  batch.summary?.recovery_rate_percent || 0,
                );

                return (
                  <div className="history-card" key={batch.batch_id}>
                    <div className="history-card-header">
                      <div className="history-batch-info">
                        <div className="history-icon">📦</div>

                        <div>
                          <span className="batch-label">Batch ID</span>

                          <h3>{batch.batch_id}</h3>
                        </div>
                      </div>

                      <span className="batch-status">Completed</span>
                    </div>

                    <div className="history-date">
                      🕒 Created: {formatDate(batch.created_at)}
                    </div>

                    <div className="history-metrics">
                      <div className="history-metric">
                        <span className="history-metric-label">Recovered</span>

                        <strong className="value-success">
                          {batch.summary?.recovered_payments ?? 0}
                        </strong>
                      </div>

                      <div className="history-metric">
                        <span className="history-metric-label">
                          Recovery Rate
                        </span>

                        <strong className="value-info">
                          {batchRecoveryRate.toFixed(2)}%
                        </strong>
                      </div>

                      <div className="history-metric">
                        <span className="history-metric-label">
                          Recovered Amount
                        </span>

                        <strong className="value-success">
                          {formatCurrency(batch.summary?.recovered_amount)}
                        </strong>
                      </div>
                    </div>

                    <div className="mini-progress-track">
                      <div
                        className="mini-progress-fill"
                        style={{
                          width: `${getPercentage(batchRecoveryRate)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data small-no-data">
              📭 No recovery batches available yet. Run a new recovery batch to
              get started.
            </div>
          )}
        </section>

        {/* ==========================================
            FOOTER
        ========================================== */}

        <footer className="dashboard-footer">
          <span>⚡ RecoverFlow AI</span>

          <span>Dashboard generated: {formatDate(dashboard.generated_at)}</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
