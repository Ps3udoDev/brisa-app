import type { Database } from "./supabase";

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];
type Enums = Database["public"]["Enums"];

// ── Enums reexportados ──
export type TransactionType = Enums["transaction_type"];

// ── Tipos base de tablas ──
export type Profile = Tables["profiles"]["Row"];
export type Transaction = Tables["transactions"]["Row"];
export type Tag = Tables["tags"]["Row"];
export type TransactionTag = Tables["transaction_tags"]["Row"];
export type BudgetRequest = Tables["budget_requests"]["Row"];
export type Goal = Tables["goals"]["Row"];
export type Debt = Tables["debts"]["Row"];
export type DebtPayment = Tables["debt_payments"]["Row"];
export type Permission = Tables["permissions"]["Row"];
export type UserBalance = Tables["user_balances"]["Row"];

// ── Tipos base de vistas ──
export type GoalProgress = Views["goal_progress"]["Row"];
export type MonthlyExpenses = Views["monthly_expenses"]["Row"];
export type DebtsSnowball = Views["v_debts_snowball"]["Row"];

// ── Tipos enriquecidos (JOINs comunes) ──

export type ProfileWithBalance = Profile & {
  user_balances?: UserBalance | null;
};

export type ProfileWithParent = Profile & {
  parent?: Profile | null;
};

export type TransactionWithTags = Transaction & {
  transaction_tags: { tag: Tag }[];
};

export type TransactionWithUsers = Transaction & {
  creator?: Profile | null;
  from_user?: Profile | null;
  to_user?: Profile | null;
  user?: Profile | null;
};

export type TransactionFull = Transaction & {
  transaction_tags: { tag: Tag }[];
  creator?: Profile | null;
  from_user?: Profile | null;
  to_user?: Profile | null;
  user?: Profile | null;
};

export type BudgetRequestWithUsers = BudgetRequest & {
  from_user?: Profile | null;
  to_user?: Profile | null;
};

export type GoalWithAssignee = Goal & {
  assigned_to_profile?: Profile | null;
};

export type GoalFull = Goal & {
  assigned_to_profile?: Profile | null;
  creator?: Profile | null;
  progress?: GoalProgress | null;
};

export type DebtWithPayments = Debt & {
  debt_payments?: DebtPayment[];
};

export type DebtWithUser = Debt & {
  user?: Profile | null;
};

export type PermissionWithUsers = Permission & {
  user?: Profile | null;
  granted_by_profile?: Profile | null;
};

// ── Roles ──
export type UserRole = "super_admin" | "jefe_operador" | "asociado";

// ── Filtros comunes ──
export type TransactionFilters = {
  userId?: string;
  type?: TransactionType;
  fromUserId?: string;
  toUserId?: string;
  status?: string;
  isRecurring?: boolean;
  isPriority?: boolean;
  tagIds?: string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type BudgetRequestFilters = {
  fromUserId?: string;
  toUserId?: string;
  status?: "pending" | "approved" | "rejected";
};

export type GoalFilters = {
  assignedTo?: string;
  creatorId?: string;
  status?: "active" | "achieved" | "cancelled";
};

export type DebtFilters = {
  userId?: string;
};

// ── Paginación ──
export type PaginatedResult<T> = {
  data: T[];
  count: number | null;
  nextPage: number | null;
};
