"use client";

import useSWR from "swr";
import { profileService } from "@/lib/services/profiles.service";
import { KEYS } from "@/lib/swr/keys";
import type { Profile } from "@/types/domain";

export function useAssociates(parentId?: string) {
  const key = parentId ? KEYS.profiles.list({ parentId }) : null;

  const { data, error, isLoading } = useSWR(
    key,
    () => profileService.list({ parentId: parentId ?? undefined }),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    associates: (data?.data ?? []) as (Profile & { user_balances?: { balance: number } | null })[],
    count: data?.count ?? 0,
    error,
    isLoading,
  };
}

export function useSubordinateProfiles(parentId?: string) {
  const key = parentId ? ["brisa", "profiles", "subordinate-profiles", parentId] : null;

  const { data, error, isLoading } = useSWR(
    key,
    () => (parentId ? profileService.getSubordinateProfiles(parentId) : []),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    profiles: (data ?? []) as (Profile & { user_balances?: { balance: number } | null })[],
    error,
    isLoading,
  };
}
