"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { onboardingStepPath } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const steps = [
  { key: "verification", label: "Verification" },
  { key: "welcome", label: "Welcome" },
] as const;

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    // Keep the user on whichever step the server says they're actually on —
    // covers a refresh mid-wizard or someone typing a later step's URL directly.
    const target = onboardingStepPath(user.onboardingStep);
    if (target !== pathname) {
      router.replace(target);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user || user.onboardingStep === "complete") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  const activeIndex = steps.findIndex((s) => s.key === user.onboardingStep);

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/30 px-6 py-12">
      <Image src="/nexworth_brand_logos/nexworth-logo-blue.png" alt="Nexworth" width={150} height={24} priority />

      <div className="mt-8 flex items-center gap-3">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  i <= activeIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <span className={cn("text-sm", i === activeIndex ? "font-medium text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="mt-8 w-full max-w-md">{children}</div>
    </div>
  );
}
