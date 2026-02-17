# Updated Process Flow: Interviewer Workflow (Glass Truth Phase 5)

## Overview
This document outlines the refined workflow for Interviewers managing resignation cases, specifically focusing on the new "Active/History" segmentation and Status Clarity protocol.

## 1. Dashboard View (`/dashboard/interview/schedule`)

### A. Active Cases Tab (Default View)
- **Goal**: Immediate visibility of actionable items.
- **Statuses Displayed**:
  - `Action Required (pending)`: New resignation requests needing scheduling.
  - `Scheduled`: Upcoming interviews.
  - `Verified`: Cases where questionnaire answers have been verified but interview not yet completed.
  - `Approved`: Resignations formally approved.
- **Actions**:
  - **Approve/Decline**: Available for `pending` cases.
  - **Schedule**: Button to open scheduling dialog.
  - **View Case**: Navigate to the specific case detail page.

### B. History Tab
- **Goal**: Access to past records without cluttering the active workspace.
- **Statuses Displayed**:
  - `Completed`: Interviews finished and processed.
  - `Cancelled`: Resignations withdrawn or cancelled.
  - `Declined`: Requests rejected by HR/Lead.
- **Actions**:
  - **View Report**: Navigate to the case report (read-only view of the completed interview).

## 2. Status Definitions

| Status | Display Label | Meaning | Action Needed |
| :--- | :--- | :--- | :--- |
| `pending` | **Action Required** | New request received. | Review & Schedule/Decline. |
| `scheduled` | **Scheduled** | Interview date set. | Prepare for interview. |
| `verified` | **Verified** | Answers checked but not closed. | Conduct interview. |
| `completed` | **Completed** | Case closed. | None (Reference only). |
| `cancelled` | **Cancelled** | Withdrawn. | None. |

## 3. Queue Logic
- All interviews are fetched initially.
- Client-side filtering segments them into tabs.
- Unresolved cases ALWAYS appear in "Active Cases" to prevent items slipping through cracks.
