export const KEYS = {
  // ── Profiles & Jerarquía ──
  profiles: {
    me: ["brisa", "profiles", "me"] as const,
    detail: (id: string) => ["brisa", "profiles", "detail", id] as const,
    list: (filters?: { role?: string; parentId?: string | null }) =>
      ["brisa", "profiles", "list", filters ?? {}] as const,
    subordinates: (parentId: string) =>
      ["brisa", "profiles", "subordinates", parentId] as const,
    hierarchyTree: (rootId: string) =>
      ["brisa", "profiles", "hierarchyTree", rootId] as const,
  },

  // ── Balances ──
  userBalances: {
    detail: (userId: string) =>
      ["brisa", "user_balances", "detail", userId] as const,
    listByParent: (parentId: string) =>
      ["brisa", "user_balances", "listByParent", parentId] as const,
  },

  // ── Transactions ──
  transactions: {
    detail: (id: string) => ["brisa", "transactions", "detail", id] as const,
    list: (filters: {
      userId?: string;
      type?: string;
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
    }) => ["brisa", "transactions", "list", filters] as const,
    summary: (userId: string, period?: string) =>
      ["brisa", "transactions", "summary", userId, period ?? "all"] as const,
  },

  // ── Tags ──
  tags: {
    list: (creatorId?: string) =>
      ["brisa", "tags", "list", creatorId ?? "all"] as const,
    detail: (id: string) => ["brisa", "tags", "detail", id] as const,
  },

  // ── Budget Requests ──
  budgetRequests: {
    detail: (id: string) => ["brisa", "budget_requests", "detail", id] as const,
    inbox: (toUserId: string) =>
      ["brisa", "budget_requests", "inbox", toUserId] as const,
    sent: (fromUserId: string) =>
      ["brisa", "budget_requests", "sent", fromUserId] as const,
    pendingApproval: (superiorId: string) =>
      ["brisa", "budget_requests", "pendingApproval", superiorId] as const,
  },

  // ── Goals ──
  goals: {
    detail: (id: string) => ["brisa", "goals", "detail", id] as const,
    list: (filters?: {
      assignedTo?: string;
      creatorId?: string;
      status?: string;
    }) => ["brisa", "goals", "list", filters ?? {}] as const,
    progress: (goalId: string) =>
      ["brisa", "goals", "progress", goalId] as const,
  },

  // ── Debts ──
  debts: {
    detail: (id: string) => ["brisa", "debts", "detail", id] as const,
    list: (userId: string) => ["brisa", "debts", "list", userId] as const,
    snowball: (userId: string) =>
      ["brisa", "debts", "snowball", userId] as const,
    payments: (debtId: string) =>
      ["brisa", "debts", "payments", debtId] as const,
  },

  // ── Permissions ──
  permissions: {
    byUser: (userId: string) =>
      ["brisa", "permissions", "byUser", userId] as const,
    check: (userId: string, perm: string) =>
      ["brisa", "permissions", "check", userId, perm] as const,
  },

  // ── Recurring rules ──
  recurringRules: {
    list: (userId: string) =>
      ["brisa", "recurring_rules", "list", userId] as const,
  },

  // ── Notifications ──
  notifications: {
    list: (userId: string) =>
      ["brisa", "notifications", "list", userId] as const,
    unreadCount: (userId: string) =>
      ["brisa", "notifications", "unreadCount", userId] as const,
  },

  // ── Vistas SQL ──
  views: {
    monthlyExpenses: (userId?: string) =>
      ["brisa", "views", "monthly_expenses", userId ?? "all"] as const,
    goalProgress: (goalId?: string) =>
      ["brisa", "views", "goal_progress", goalId ?? "all"] as const,
    debtsSnowball: (userId?: string) =>
      ["brisa", "views", "v_debts_snowball", userId ?? "all"] as const,
  },
} as const;

// Helper para invalidación masiva por entidad
export const matchEntity = (entity: string) => (key: unknown) => {
  if (!Array.isArray(key)) return false;
  return key[0] === "brisa" && key[1] === entity;
};
