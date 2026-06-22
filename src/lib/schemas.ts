import { z } from "zod";

// ── Auth ──
export const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
});

export const registerUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  first_name: z.string().min(1).max(100).optional(),
  middle_name: z.string().max(100).optional(),
  last_name1: z.string().max(100).optional(),
  last_name2: z.string().max(100).optional(),
  role: z.enum(["asociado", "jefe_operador"]).default("asociado"),
  parent_id: z.uuid().optional(),
});

// ── Transactions ──
export const transactionSchema = z.object({
  type: z.enum([
    "income",
    "expense",
    "budget_assignment",
    "debt_payment",
    "goal_contribution",
  ]),
  amount: z.number().positive("El monto debe ser positivo"),
  description: z.string().max(500).optional(),
  justification: z.string().max(2000).optional(),
  is_recurring: z.boolean().default(false),
  recurring_freq: z
    .enum(["daily", "weekly", "biweekly", "monthly", "yearly"])
    .optional(),
  is_priority: z.boolean().default(true),
  status: z.enum(["completed", "pending"]).default("completed"),
  user_id: z.uuid(),
  from_user_id: z.uuid().optional(),
  to_user_id: z.uuid().optional(),
});

export const transactionFiltersSchema = z.object({
  userId: z.uuid().optional(),
  type: z
    .enum([
      "income",
      "expense",
      "budget_assignment",
      "debt_payment",
      "goal_contribution",
    ])
    .optional(),
  status: z.string().optional(),
  isRecurring: z.boolean().optional(),
  isPriority: z.boolean().optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ── Tags ──
export const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(7).optional(), // hex color
});

// ── Budget Requests ──
export const budgetRequestSchema = z.object({
  to_user_id: z.uuid(),
  amount: z.number().positive(),
  reason: z.string().max(1000).optional(),
});

export const budgetRequestFiltersSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

// ── Goals ──
export const goalSchema = z.object({
  name: z.string().min(1).max(200),
  target_amount: z.number().positive(),
  deadline: z.iso.date().optional(),
  assigned_to: z.uuid().optional(),
  status: z.enum(["active", "achieved", "cancelled"]).default("active"),
});

// ── Debts ──
export const debtSchema = z.object({
  name: z.string().min(1).max(200),
  total_amount: z.number().positive(),
  current_balance: z.number().positive(),
  interest_rate: z.number().min(0).max(100).optional(),
  minimum_payment: z.number().positive().optional(),
  due_date: z.iso.date().optional(),
});

export const debtPaymentSchema = z.object({
  debt_id: z.uuid(),
  amount: z.number().positive(),
  transaction_id: z.uuid().optional(),
});

// ── Profile update ──
export const profileUpdateSchema = z.object({
  first_name: z.string().max(100).optional(),
  middle_name: z.string().max(100).optional(),
  last_name1: z.string().max(100).optional(),
  last_name2: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  avatar_url: z.url().max(500).optional().or(z.literal("")),
  timezone: z.string().max(60).optional(),
});

// ── Account (Supabase Auth) ──
export const accountUpdateSchema = z
  .object({
    email: z.email().optional(),
    password: z.string().min(8, "Mínimo 8 caracteres").max(128).optional(),
  })
  .refine((d) => d.email || d.password, {
    message: "Indica un nuevo correo o una nueva contraseña",
  });

// ── Gestión de usuarios (super_admin) ──
export const toggleUserActiveSchema = z.object({
  userId: z.uuid(),
  isActive: z.boolean(),
});

// ── Types inferidos ──
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type BudgetRequestInput = z.infer<typeof budgetRequestSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type DebtInput = z.infer<typeof debtSchema>;
export type DebtPaymentInput = z.infer<typeof debtPaymentSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>;
