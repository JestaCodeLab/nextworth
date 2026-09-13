"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Credential } from "@/lib/types";

interface CredentialState {
  credential: Credential | null;
  loading: boolean;
}

export function useCredential() {
  const [state, setState] = useState<CredentialState>({ credential: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ credential: Credential | null }>("/credentials/me")
      .then((data) => {
        if (!cancelled) setState({ credential: data.credential, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ credential: null, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await apiFetch<{ credential: Credential | null }>("/credentials/me");
      setState({ credential: data.credential, loading: false });
    } catch {
      setState({ credential: null, loading: false });
    }
  }, []);

  return { ...state, refresh };
}
