"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { onboardingStepPath } from "@/lib/onboarding";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    if (user.onboardingStep !== "complete") {
      router.replace(onboardingStepPath(user.onboardingStep));
    }
  }, [loading, user, router]);

  if (loading || !user || user.onboardingStep !== "complete") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar variant="user" />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 bg-muted/30 p-8">{children}</main>
      </div>
    </div>
  );
}
