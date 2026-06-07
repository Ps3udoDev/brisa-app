import { createBrowserSB } from "@/lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

export const getClient = () => createBrowserSB();

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly original?: PostgrestError
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export const handleError = (error: PostgrestError | null): void => {
  if (error) {
    throw new ServiceError(error.message, error.code, error);
  }
};

export type PaginatedResult<T> = {
  data: T[];
  count: number | null;
  nextPage: number | null;
};

export const buildPaginatedResult = <T>(
  data: T[],
  count: number | null,
  page: number,
  limit: number
): PaginatedResult<T> => ({
  data,
  count,
  nextPage: count && count > page * limit ? page + 1 : null,
});
