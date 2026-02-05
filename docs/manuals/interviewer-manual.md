# The Interviewer's Protocol: Field Operations

As an Interviewer, your mission is to ensure data integrity through the "Live Correction" process.

## 1. Unified Dashboard
Upon login, you will see the **Dashboard Home**. This is your command center for active cases:
- **Notice Period**: Track resignations in the "Pending" and "Verified" states.
- **Upcoming Interviews**: Monitor the "Scheduled" queue.

## 2. The 4-Step Engagement Flow
Follow these protocols for every exit notice:
1. **Verification**: Confirm the employee's Last Working Day. This triggers the initial acknowledgment email.
2. **Scheduling**: Input the interview date. **CAUTION**: Setting this date triggers the **Lock Timer**.
3. **The Lock (24h Prior)**: The system automatically locks the employee out of the form 24 hours before the scheduled time. This ensures you are reviewing a stable dataset.
4. **Live Correction**: Access the interview view (`/dashboard/interview/[id]`). 
   - **Split View**: See the Employee's drafted response on the right and your input field on the left.
   - **Protocol**: If the verbal response contradicts the drafted text, record the "Corrected Answer". These corrections are tracked to identify "Most Misunderstood Questions."

## 3. The Final Seal
Once the session is complete, submit the "Thumbs Up". This removes the record from the active queue and anonymizes the data for general reporting.
