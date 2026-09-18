"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PageLoader } from "@/components/page-loader";
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
    return <PageLoader />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar variant="user" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {/* Padding lives on this inner div rather than on `main` itself —
              padding on the scrolling element is a well-known blocker for
              `position: sticky` children (their `top: 0` sticks flush to
              the scroll container's *padding* edge, leaving a permanent
              gap). Keeping `main` padding-free lets sticky content (e.g.
              Find Merchants' filter bar) sit flush under the topbar. */}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
