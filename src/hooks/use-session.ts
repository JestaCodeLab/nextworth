"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

interface SessionState {
  user: SessionUser | null;
  loading: boolean;
}

export function useSession() {
  const [state, setState] = useState<SessionState>({ user: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ user: SessionUser }>("/auth/me")
      .then((data) => {
        if (!cancelled) setState({ user: data.user, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ user: null, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await apiFetch<{ user: SessionUser }>("/auth/me");
      setState({ user: data.user, loading: false });
    } catch {
      setState({ user: null, loading: false });
    }
  }, []);

  return { ...state, refresh };
}
