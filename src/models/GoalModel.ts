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
  /** Aporte mensal pretendido — base da projeção quando informado. */
  monthlyPlan?: number | string | null;
  startDate: string;
  targetDate: string;
  type: "SHORT" | "MEDIUM" | "LONG";
  priority: "ESSENTIAL" | "IMPORTANT" | "DESIRABLE";
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  members?: GoalMember[];
  isOwner?: boolean;
};

export type CreateGoalForm = {
  title: string;
  description?: string;
  targetValue: number;
  monthlyPlan?: number | null;
  startDate: string;
  targetDate?: string;
  type: "SHORT" | "MEDIUM" | "LONG";
  priority: "ESSENTIAL" | "IMPORTANT" | "DESIRABLE";
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
};
