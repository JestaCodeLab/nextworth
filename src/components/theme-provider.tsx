"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Defaults to light rather than following system preference — the brand
 * (auth split-screen, credential card) is designed light-first, and we'd
 * rather a first-time visitor opt into dark mode than land on it by
 * surprise because their OS happens to be dark.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
