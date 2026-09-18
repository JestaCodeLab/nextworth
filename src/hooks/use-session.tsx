"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

const WARNING_LEAD_MS = 5 * 60 * 1000;

interface SessionState {
  user: SessionUser | null;
  loading: boolean;
  // Epoch ms, not a Date — keeps this a stable primitive for effect deps
  // instead of a new object identity every time it's re-parsed from the API.
  expiresAt: number | null;
  showExpiryWarning: boolean;
}

interface SessionContextValue extends SessionState {
  refresh: () => Promise<void>;
  extendSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function toEpochMs(value?: string): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({ user: null, loading: true, expiresAt: null, showExpiryWarning: false });
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    warningTimer.current = null;
    expiryTimer.current = null;
  }, []);

  const logout = useCallback(async () => {
    clearTimers();
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // best-effort — the session is being cleared locally regardless
    }
    setState({ user: null, loading: false, expiresAt: null, showExpiryWarning: false });
  }, [clearTimers]);

  // Schedules the "5 minutes left" warning and a hard auto-logout at the
  // token's real expiry — so the UI stops silently pretending the user is
  // still signed in once the session cookie is actually dead.
  useEffect(() => {
    clearTimers();
    if (!state.expiresAt) return;

    const msUntilExpiry = state.expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    const msUntilWarning = msUntilExpiry - WARNING_LEAD_MS;
    if (msUntilWarning <= 0) {
      setState((s) => (s.showExpiryWarning ? s : { ...s, showExpiryWarning: true }));
    } else {
      warningTimer.current = setTimeout(() => {
        setState((s) => ({ ...s, showExpiryWarning: true }));
      }, msUntilWarning);
    }

    expiryTimer.current = setTimeout(logout, msUntilExpiry);

    return clearTimers;
  }, [state.expiresAt, clearTimers, logout]);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ user: SessionUser; expiresAt?: string }>("/auth/me")
      .then((data) => {
        if (!cancelled) {
          setState({ user: data.user, loading: false, expiresAt: toEpochMs(data.expiresAt), showExpiryWarning: false });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ user: null, loading: false, expiresAt: null, showExpiryWarning: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await apiFetch<{ user: SessionUser; expiresAt?: string }>("/auth/me");
      setState({ user: data.user, loading: false, expiresAt: toEpochMs(data.expiresAt), showExpiryWarning: false });
    } catch {
      setState({ user: null, loading: false, expiresAt: null, showExpiryWarning: false });
    }
  }, []);

  const extendSession = useCallback(async () => {
    const data = await apiFetch<{ expiresAt?: string }>("/auth/refresh", { method: "POST" });
    setState((s) => ({ ...s, expiresAt: toEpochMs(data.expiresAt), showExpiryWarning: false }));
  }, []);

  return (
    <SessionContext.Provider value={{ ...state, refresh, extendSession, logout }}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
