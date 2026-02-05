# Data Retention Policy: Information Lifecycle

The Retention Intelligence Hub adheres to a strict information lifecycle to minimize data exposure and maintain platform efficiency.

## 1. Retention Periods
Data is retained according to its state in the Resignation Flow:

| State | Retention Period | Action |
|-------|------------------|--------|
| **Pending / Verified** | Active until interview | Standard access. |
| **Scheduled / Locked**| Until completion | Strictly governed by the Lock Timer (24h prior). |
| **Completed** | 7 Years | Archival storage for long-term trend analysis. |
| **Declined / Cancelled**| 12 Months | Purged from system after annual audit cycle. |

## 2. Anonymization Protocol
Upon reaching the **`completed`** state:
- The system triggers the "Final Seal" logic.
- Identifying fields are masked in all standard analytics dashboards.
- Individual response IDs are disconnected from the user's active session tracking.

## 3. Data Deletion Requests
Employees have the right to request the deletion of their perception data after their exit date. Such requests must be processed by a **System Lead** through the "Barracks" (User Management) audit interface if applicable, or via manual DB correction if the system interface is not available.

## 4. Archival Purpose
Historical data is preserved specifically for **Turnover Trending** and **Departmental Performance** metrics (e.g., Turnover by Tenure), ensuring the organization can learn from past talent movements.
