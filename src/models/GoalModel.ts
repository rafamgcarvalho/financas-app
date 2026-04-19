export type GoalMember = {
  id: string;
  userId: string;
  name: string;
  username: string;
  role: "OWNER" | "MEMBER";
  joinedAt?: string;
};

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
  members?: GoalMember[];
  isOwner?: boolean;
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
