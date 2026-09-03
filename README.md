# RecoverFlow AI 💳🤖

### AI-Powered Payment Failure Recovery & Revenue Protection System

RecoverFlow AI is an intelligent payment recovery system designed to analyze failed payments, identify possible failure causes, apply safety policies, and recommend or execute controlled recovery actions.

The system combines **AI-powered diagnosis**, **deterministic fallback logic**, **policy-based safety controls**, **controlled recovery execution**, **batch processing**, **persistent audit trails**, and a **real-time dashboard**.

---

## 🚀 Problem Statement

Failed online payments can result in significant revenue loss.

Common reasons include:

- Network timeouts
- Technical failures
- Bank declines
- Insufficient funds
- Authentication issues
- Customer abandonment

Simply retrying every failed payment is not always safe or effective.

RecoverFlow AI addresses this problem by intelligently analyzing failed payments and determining the appropriate recovery strategy.

---

## 💡 Solution

RecoverFlow AI follows a controlled recovery pipeline:

```text
Failed Payment
      ↓
AI Diagnosis
      ↓
Fallback Diagnosis (if AI is unavailable)
      ↓
Safety Policy Evaluation
      ↓
Recovery Decision
      ↓
Controlled Execution
      ↓
Audit Trail
      ↓
Analytics Dashboard
```

3. Safety Policy Engine

AI does not directly execute payment actions.

Every recommended action is passed through a policy and safety layer before execution.

Possible policy decisions include:

APPROVE
BLOCK
ESCALATE

This ensures controlled and safe recovery behavior.

4. Recovery Batch Processing

The system can process multiple failed payments as a recovery batch.

For each failed payment, the system:

Analyzes the payment
Generates a diagnosis
Recommends an action
Applies policy validation
Executes the simulated recovery action if approved
Records the outcome
Saves the batch for future analytics 5. Recovery Analytics Dashboard

The frontend dashboard provides a clear view of payment and recovery performance.

It displays:

Total payments
Successful payments
Failed payments
Revenue at risk
Recovered amount
Recovery rate
Money recovery rate
AI calls used
AI failures
Fallback decisions
Blocked actions
Escalated cases
Latest recovery batch
Recovery batch history
Audit trail 6. Persistent Recovery Batch History

Recovery batches are saved locally so that previous recovery results can be viewed later.

The dashboard displays recent recovery batches with information such as:

Batch ID
Creation time
Recovered payments
Recovery rate
Recovered amount 7. Persistent Audit Trail

Important recovery actions are recorded in a persistent audit trail.

Each record can contain information about:

Payment ID
Recommended action
Policy decision
Execution status
Recovery outcome
Timestamp

This improves transparency and traceability.

🏗️ System Architecture

     3. Safety Policy Engine

AI does not directly execute payment actions.

Every recommended action is passed through a policy and safety layer before execution.

Possible policy decisions include:

APPROVE
BLOCK
ESCALATE

This ensures controlled and safe recovery behavior.

4. Recovery Batch Processing

The system can process multiple failed payments as a recovery batch.

For each failed payment, the system:

Analyzes the payment
Generates a diagnosis
Recommends an action
Applies policy validation
Executes the simulated recovery action if approved
Records the outcome
Saves the batch for future analytics 5. Recovery Analytics Dashboard

The frontend dashboard provides a clear view of payment and recovery performance.

It displays:

Total payments
Successful payments
Failed payments
Revenue at risk
Recovered amount
Recovery rate
Money recovery rate
AI calls used
AI failures
Fallback decisions
Blocked actions
Escalated cases
Latest recovery batch
Recovery batch history
Audit trail 6. Persistent Recovery Batch History

Recovery batches are saved locally so that previous recovery results can be viewed later.

The dashboard displays recent recovery batches with information such as:

Batch ID
Creation time
Recovered payments
Recovery rate
Recovered amount 7. Persistent Audit Trail

Important recovery actions are recorded in a persistent audit trail.

Each record can contain information about:

Payment ID
Recommended action
Policy decision
Execution status
Recovery outcome
Timestamp

This improves transparency and traceability.

## 🏗️ System Architecture

```text
┌──────────────────────┐
│   Failed Payments    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ AI Payment Diagnosis │
│     Gemini AI        │
└──────────┬───────────┘
           │
           ▼
     AI available?
       /       \
     Yes        No
      │          │
      ▼          ▼
┌─────────────┐ ┌──────────────────────────┐
│ AI Diagnosis│ │ Deterministic Fallback   │
└──────┬──────┘ └────────────┬─────────────┘
       │                     │
       └──────────┬──────────┘
                  ▼
┌──────────────────────┐
│ Recommended Action   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Safety Policy Engine │
└──────────┬───────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
 APPROVE    BLOCK / ESCALATE
     │
     ▼
┌──────────────────────┐
│ Recovery Execution   │
│    (Simulated)       │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Batch + Audit Log    │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ React Dashboard      │
└──────────────────────┘
```

## 📸 Project Screenshots

### RecoverFlow AI Dashboard

![RecoverFlow AI Dashboard](./screenshots/dashboard.png)

### Recovery Batch History

![Recovery Batch History](./screenshots/batch_history.png)

### Audit Trail

![Audit Trail](./screenshots/audit_trail.png)

       🛠️ Tech Stack

Frontend
React
Vite
JavaScript
CSS
Fetch API
Backend
Node.js
Express.js
JavaScript

AI
Google Gemini API
@google/genai
Data Storage

Currently, the project uses JSON-based local persistence for:

Payment data
Recovery batches
Audit logs

📂 Project Structure

```text
Razorpay-Buildathon/
│
├── backend/
│ │
│ ├── services/
│ │ ├── aiService.js
│ │ ├── paymentService.js
│ │ ├── recoveryService.js
│ │ ├── recoveryBatchService.js
│ │ ├── dashboardService.js
│ │ └── auditService.js
│ │
│ ├── data/
│ │ ├── payments.json
│ │ ├── batches.json
│ │ └── auditLogs.json
│ │
│ ├── server.js
│ ├── package.json
│ └── .env
│
├── frontend/
│ │
│ ├── src/
│ │ ├── App.jsx
│ │ ├── App.css
│ │ └── main.jsx
│ │
│ ├── package.json
│ └── vite.config.js
│
├── README.md
└── .gitignore

```

## ⚙️ Installation and Setup

Follow these steps to run RecoverFlow AI locally.

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project directory:

```bash
cd Razorpay-Buildathon
```

---

### 2. Backend Setup

Open a terminal and move to the backend folder:

```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server:

```bash
npm run dev
```

The backend server will run on:

`http://localhost:5000`

---

### 3. Frontend Setup

Open a **new terminal**.

Move to the frontend folder:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Start the frontend application:

```bash
npm run dev
```

Vite will display a local URL in the terminal, similar to:

```text
http://localhost:5173
```

Open that URL in your browser to use the RecoverFlow AI dashboard.

---

## 🔌 API Workflow

### 1. Diagnose a Payment

```http
GET /api/payments/:paymentId/diagnose
```

The system analyzes a failed payment using Gemini AI.

If the AI service is unavailable or rate-limited, RecoverFlow AI automatically uses deterministic fallback logic.

---

### 2. Apply Safety Policy

Before a recovery action is executed, the recommended action passes through the safety policy layer.

Example policy response:

```json
{
  "decision": "APPROVE",
  "action": "retry_payment",
  "reason": "Recovery action passed all safety policy checks"
}
```

---

### 3. Execute Recovery

An approved recovery action can then be executed.

Example execution result:

```json
{
  "executed": true,
  "outcome": "recovered",
  "recovered_amount": 1612
}
```

> **Note:** Recovery execution is currently simulated. No real payment transaction is performed.

---

### 4. Run a Recovery Batch

```http
POST /api/recovery/batch
```

This endpoint processes failed payments as a recovery batch.

For each payment, the system:

1. Analyzes the payment failure.
2. Generates an AI or fallback diagnosis.
3. Recommends a recovery action.
4. Applies safety policy validation.
5. Executes the simulated recovery action when approved.
6. Records the recovery outcome.
7. Saves batch and audit information for future analysis.

The dashboard is then refreshed with the latest recovery metrics and batch history.

---

## 🛡️ Reliability Design

RecoverFlow AI is designed so that the recovery workflow does not depend completely on an external AI service.

### When Gemini AI is Available

```text
Gemini AI
    │
    ▼
AI Diagnosis
    │
    ▼
Safety Policy
    │
    ▼
Recovery Execution
```

### When Gemini AI is Unavailable or Rate-Limited

```text
Gemini AI Failure / Rate Limit
            │
            ▼
Deterministic Fallback Diagnosis
            │
            ▼
Safety Policy
            │
            ▼
Recovery Execution
```

This fallback mechanism allows the system to continue processing payment recovery workflows even when the external AI API is unavailable.

---

## 📊 Current Dashboard Capabilities

The RecoverFlow AI dashboard provides:

- 🔄 Real-time dashboard refresh
- ⏳ Loading state
- ❌ Error state handling
- ⏳ Recovery batch running state
- ✅ Success message after batch completion
- 📭 Empty batch history state
- 📦 Latest 5 recovery batches
- 📈 Progress indicators
- 💰 Payment and recovery metrics
- 🤖 AI system metrics
- 🧠 AI and fallback diagnosis tracking
- 🛡️ Policy decision tracking
- 📝 Persistent recovery batch history
- 🔍 Persistent audit trail

---

## 🚀 Future Improvements

Possible future enhancements include:

- Database integration using MongoDB or PostgreSQL
- User authentication
- Role-based access control
- Real payment gateway integration
- Background job processing
- Scheduled retry mechanisms
- Email recovery links
- Advanced analytics and charts
- Production deployment
- Docker containerization

## 🎯 Project Demonstration Flow

A typical RecoverFlow AI recovery workflow follows these steps:

```text
1. Payment Fails
        ↓
2. AI Analyzes the Failure
        ↓
3. Deterministic Fallback is Used if AI is Unavailable
        ↓
4. Recovery Action is Recommended
        ↓
5. Safety Policy Validates the Action
        ↓
6. Approved Action is Executed
        ↓
7. Recovery Outcome is Recorded
        ↓
8. Batch and Audit Information are Stored
        ↓
9. Dashboard Displays Updated Results
```

### Workflow Summary

1. **Payment Failure**  
   A failed payment enters the RecoverFlow AI recovery pipeline.

2. **AI Diagnosis**  
   Gemini AI analyzes the available payment context and identifies the possible failure cause.

3. **Fallback Protection**  
   If Gemini AI is unavailable or rate-limited, deterministic fallback logic provides a reliable diagnosis.

4. **Recovery Recommendation**  
   The system selects an appropriate recovery action based on the diagnosis.

5. **Safety Policy Validation**  
   Every recommended action is checked by the policy engine before execution.

6. **Controlled Execution**  
   Only approved actions are executed through the simulated recovery executor.

7. **Outcome Recording**  
   The result of the recovery attempt, including the recovered amount and outcome, is recorded.

8. **Persistent Storage**  
   Recovery batch information and audit records are saved for traceability and future analysis.

9. **Dashboard Update**  
   The React dashboard refreshes to display the latest recovery metrics and batch history.

---

## 🧠 Key Learning Areas

This project demonstrates practical experience with:

- 🤖 **AI API Integration** — Integrating Gemini AI for payment failure diagnosis.
- 🔄 **AI Fallback Strategies** — Continuing the workflow when the external AI service is unavailable.
- ⚙️ **Backend API Development** — Building backend APIs using Node.js and Express.js.
- ⚛️ **React Frontend Development** — Creating an interactive dashboard using React and Vite.
- 💳 **Payment Failure Analysis** — Analyzing different causes of failed payment transactions.
- 🛡️ **Safety Policy Design** — Validating recovery actions before execution.
- 💾 **Persistent Data Storage** — Storing payment, batch, and recovery-related data using JSON files.
- 📝 **Audit Logging** — Recording important recovery events for transparency and traceability.
- ❌ **Error Handling** — Handling AI failures, rate limits, and API errors gracefully.
- 📡 **API Reliability** — Designing the system to remain functional even when the AI API is unavailable.
- 🌐 **Full-Stack Application Development** — Connecting the React frontend with a Node.js/Express backend.
