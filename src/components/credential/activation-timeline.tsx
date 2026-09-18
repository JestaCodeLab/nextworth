import { UserPlus, IdCard, Clock, CreditCard, ShieldCheck, Check, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser, Credential } from "@/lib/types";

type StepStatus = "complete" | "current" | "upcoming" | "error";

interface Step {
  key: string;
  label: string;
  icon: LucideIcon;
  status: StepStatus;
}

function computeSteps(user: SessionUser, credential: Credential | null): Step[] {
  const docsSubmitted = Boolean(user.dob);
  const isRejected = user.status === "rejected";
  const isVerified = user.status === "verified";
  const isPaid = Boolean(credential) && credential!.status !== "pending";

  const verifyStatus: StepStatus = isRejected ? "error" : docsSubmitted ? "complete" : "current";
  const reviewStatus: StepStatus = isRejected
    ? "upcoming"
    : isVerified
      ? "complete"
      : docsSubmitted
        ? "current"
        : "upcoming";
  const paymentStatus: StepStatus = isPaid ? "complete" : isVerified ? "current" : "upcoming";
  const activatedStatus: StepStatus = isPaid ? "complete" : "upcoming";

  return [
    { key: "signup", label: "Sign Up", icon: UserPlus, status: "complete" },
    { key: "verify", label: "Verify Identity", icon: IdCard, status: verifyStatus },
    { key: "review", label: "Under Review", icon: Clock, status: reviewStatus },
    { key: "payment", label: "Payment", icon: CreditCard, status: paymentStatus },
    { key: "activated", label: "Activated", icon: ShieldCheck, status: activatedStatus },
  ];
}

function nextStepMessage(user: SessionUser, credential: Credential | null): string {
  if (user.status === "rejected") {
    return user.rejectionReason
      ? `Documents rejected: ${user.rejectionReason}`
      : "Your documents were rejected — resubmit with clearer or updated documents.";
  }
  if (!user.dob) return "Next: upload your photo and ID to verify your identity.";
  if (user.status === "pending") return "We're reviewing your documents — you'll be notified once it's done.";
  if (!credential || credential.status === "pending") {
    return "You're verified! Pay the annual card fee to activate your credential.";
  }
  return "You're all set — your discount credential is active.";
}

const circleStyles: Record<StepStatus, string> = {
  complete: "bg-success text-success-foreground",
  current: "bg-primary text-primary-foreground ring-4 ring-primary/20",
  upcoming: "border-2 border-border bg-card text-muted-foreground",
  error: "bg-destructive text-destructive-foreground",
};

const labelStyles: Record<StepStatus, string> = {
  complete: "text-foreground",
  current: "text-foreground",
  upcoming: "text-muted-foreground",
  error: "text-destructive",
};

export function ActivationTimeline({ user, credential }: { user: SessionUser; credential: Credential | null }) {
  const steps = computeSteps(user, credential);
  const message = nextStepMessage(user, credential);
  const segment = 100 / (steps.length - 1);

  return (
    <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <div className="px-6">
        <div className="relative h-17.5">
          {steps.slice(0, -1).map((step, i) => (
            <div
              key={step.key}
              className={cn("absolute top-5 h-0.5 -translate-y-1/2", step.status === "complete" ? "bg-success" : "bg-border")}
              style={{ left: `${i * segment}%`, width: `${segment}%` }}
            />
          ))}

          {steps.map((step, i) => {
            const Icon = step.status === "complete" ? Check : step.status === "error" ? TriangleAlert : step.icon;
            return (
              <div
                key={step.key}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-2"
                style={{ left: `${i * segment}%` }}
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", circleStyles[step.status])}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className={cn("text-center text-xs font-medium whitespace-nowrap", labelStyles[step.status])}>{step.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
