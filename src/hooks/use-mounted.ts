"use client";

import { useEffect, useState } from "react";

/**
 * True only after the client has hydrated. Guards theme-dependent rendering
 * (next-themes' `resolvedTheme` can already reflect a stored preference on
 * the client's very first render, which differs from the server's render
 * and triggers a hydration mismatch) — gate on this instead of reading
 * `resolvedTheme` directly.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
