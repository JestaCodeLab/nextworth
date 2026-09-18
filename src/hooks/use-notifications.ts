"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AppNotification } from "@/lib/types";

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({ notifications: [], unreadCount: 0, loading: true });

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ notifications: AppNotification[]; unreadCount: number }>("/users/me/notifications")
      .then((data) => {
        if (!cancelled) setState({ notifications: data.notifications, unreadCount: data.unreadCount, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<{ notifications: AppNotification[]; unreadCount: number }>("/users/me/notifications");
      setState({ notifications: data.notifications, unreadCount: data.unreadCount, loading: false });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    setState((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - (s.notifications.find((n) => n.id === id)?.read ? 0 : 1)),
      loading: s.loading,
    }));
    try {
      await apiFetch(`/users/me/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // best-effort; next refresh() will reconcile
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setState((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0, loading: s.loading }));
    try {
      await apiFetch("/users/me/notifications/read-all", { method: "POST" });
    } catch {
      // best-effort; next refresh() will reconcile
    }
  }, []);

  return { ...state, refresh, markRead, markAllRead };
}
