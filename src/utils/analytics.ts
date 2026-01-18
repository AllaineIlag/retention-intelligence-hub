export interface DashboardStats {
  turnover_rate: {
    active_employees: number;
    total_resignations: number;
    rate_percentage: string;
  };
  status_breakdown: {
    pending: number;
    scheduled: number;
    completed: number;
  };
  misunderstood_questions: {
    question_id: string;
    average_score: number;
    text?: string;
  }[];
}

export function calculateDashboardStats(
  employees: unknown[],
  resignations: {
    status: string;
    exit_form_answers?: Record<string, string | number>;
  }[],
  questions: { id: string; type: string; text?: string }[],
): DashboardStats {
  const activeEmployees = employees.length;
  const totalResignations = resignations.length;

  // 1. Turnover Rate (Simple MVP Calculation)
  // Rate = (Resignations / Total Employees) * 100
  const totalWorkforce = activeEmployees + totalResignations; // Approximating total pool
  const rate =
    totalWorkforce > 0
      ? ((totalResignations / totalWorkforce) * 100).toFixed(1)
      : "0.0";

  // 2. Status Breakdown
  const pending = resignations.filter((r) => r.status === "pending").length;
  const scheduled = resignations.filter((r) => r.status === "scheduled").length; // Assuming 'scheduled' is a valid status or maps to pending with date
  const completed = resignations.filter((r) => r.status === "completed").length;

  // 3. Misunderstood Questions (Low Satisfaction Analysis)
  // We look at "scale" questions in exit_form_answers
  const scoreMap: Record<string, { total: number; count: number }> = {};
  const scaleQuestions = questions.filter((q) => q.type === "scale");

  resignations.forEach((r) => {
    const answers = r.exit_form_answers;
    if (!answers) return;

    scaleQuestions.forEach((q) => {
      const val = answers[q.id];
      if (typeof val === "number") {
        if (!scoreMap[q.id]) {
          scoreMap[q.id] = { total: 0, count: 0 };
        }
        scoreMap[q.id].total += val;
        scoreMap[q.id].count += 1;
      }
    });
  });

  const misunderstood_questions = Object.entries(scoreMap)
    .map(([id, data]) => ({
      question_id: id,
      average_score:
        data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0,
      text: questions.find((q) => q.id === id)?.text,
    }))
    .filter((item) => item.average_score < 3.5) // Threshold for "Problem Area"
    .sort((a, b) => a.average_score - b.average_score) // Lowest first
    .slice(0, 5); // Top 5 worst areas

  return {
    turnover_rate: {
      active_employees: activeEmployees,
      total_resignations: totalResignations,
      rate_percentage: rate,
    },
    status_breakdown: {
      pending,
      scheduled,
      completed,
    },
    misunderstood_questions,
  };
}
