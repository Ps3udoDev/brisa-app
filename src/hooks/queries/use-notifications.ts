"use client";

import { useEffect, useCallback } from "react";
import useSWR from "swr";
import { notificationService } from "@/lib/services/notifications.service";
import type { Notification } from "@/lib/services/notifications.service";
import { getClient } from "@/lib/services/_base";
import { KEYS } from "@/lib/swr/keys";

export function useNotifications(userId?: string) {
  const key = userId ? KEYS.notifications.list(userId) : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => (userId ? notificationService.list(userId) : []),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const client = getClient();
    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          mutate();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, mutate]);

  const markAsRead = useCallback(
    async (id: string) => {
      await notificationService.markAsRead(id);
      mutate();
    },
    [mutate]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await notificationService.markAllAsRead(userId);
    mutate();
  }, [userId, mutate]);

  return {
    notifications: (data ?? []) as Notification[],
    unreadCount: (data ?? []).filter((n) => !n.read).length,
    error,
    isLoading,
    markAsRead,
    markAllAsRead,
    mutate,
  };
}

export function useUnreadNotificationCount(userId?: string) {
  const key = userId ? KEYS.notifications.unreadCount(userId) : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => (userId ? notificationService.getUnreadCount(userId) : 0),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      refreshInterval: 30000, // poll cada 30s como fallback
    }
  );

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const client = getClient();
    const channel = client
      .channel(`notifications-count:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => mutate()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => mutate()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, mutate]);

  return {
    count: data ?? 0,
    error,
    isLoading,
    mutate,
  };
}
