import { Database } from "./supabase";

export type Tables = Database["public"]["Tables"];
export type InsertTables = Tables[keyof Tables]["Insert"];
export type UpdateTables = Tables[keyof Tables]["Update"];

export type { Database };
