"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/hooks/use-session";

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Mounted once at the app root — warns 5 minutes before the session token expires, with a live countdown. */
export function SessionExpiryModal() {
  const { user, showExpiryWarning, expiresAt, extendSession, logout } = useSession();
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [extending, setExtending] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!showExpiryWarning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [showExpiryWarning]);

  if (!user || !showExpiryWarning || !expiresAt) return null;

  async function handleStayLoggedIn() {
    setExtending(true);
    try {
      await extendSession();
    } finally {
      setExtending(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.push("/sign-in");
  }

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Your session is about to expire
          </AlertDialogTitle>
          <AlertDialogDescription>
            For your security, you&apos;ll be signed out in{" "}
            <span className="font-semibold text-foreground">{formatCountdown(expiresAt - now)}</span>. Stay logged in
            to keep working, or log out now.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="text-destructive hover:text-destructive"
            onClick={handleLogout}
            disabled={loggingOut || extending}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleStayLoggedIn} disabled={extending || loggingOut}>
            {extending ? "Extending..." : "Stay logged in"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
