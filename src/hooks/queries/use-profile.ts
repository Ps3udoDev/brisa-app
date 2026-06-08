"use client";

import useSWR from "swr";
import { profileService } from "@/lib/services/profiles.service";
import { KEYS } from "@/lib/swr/keys";
import type { Profile } from "@/types/domain";

export function useProfile(userId?: string) {
  const key = userId ? KEYS.profiles.detail(userId) : KEYS.profiles.me;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => {
      if (userId) {
        return profileService.getById(userId);
      }
      return profileService.getMe();
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    profile: data as (Profile & { user_balances?: { balance: number } | null }) | undefined,
    error,
    isLoading,
    mutate,
  };
}

export function useSubordinates(parentId: string) {
  const { data, error, isLoading } = useSWR(
    KEYS.profiles.subordinates(parentId),
    () => profileService.getSubordinates(parentId),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    subordinates: data ?? [],
    error,
    isLoading,
  };
}
