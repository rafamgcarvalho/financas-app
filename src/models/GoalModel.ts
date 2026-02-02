export type GoalModel = {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  targetDate: string;
  type: "SHORT" | "MEDIUM" | "LONG";
  priority: "LOW" | "MEDIUM" | "ESSENTIAL";
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
};

export type CreateGoalForm = {
  title: string;
  description?: string;
  targetValue: number;
  startDate: string;
  targetDate?: string;
  type: "SHORT" | "MEDIUM" | "LONG";
  priority: "LOW" | "MEDIUM" | "ESSENTIAL";
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
};

