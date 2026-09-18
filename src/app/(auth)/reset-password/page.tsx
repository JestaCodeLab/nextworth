"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/icon-input";
import { apiFetch, ApiError } from "@/lib/api";
import { onboardingStepPath } from "@/lib/onboarding";
import { useSession } from "@/hooks/use-session";
import type { SessionUser } from "@/lib/types";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { refresh } = useSession();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(token) && password.length >= 8 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || !token) return;

    setSubmitting(true);
    try {
      const { user } = await apiFetch<{ user: SessionUser }>("/auth/set-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      await refresh();
      toast.success("Password set — welcome to Nexworth.");
      router.push(onboardingStepPath(user.onboardingStep));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Invalid link</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This password-setup link is missing its token. Please use the link from your email, or contact support if
          it&apos;s expired.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Set your password</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose a password to activate your Nexworth account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput
            id="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <PasswordInput
            id="confirm-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords don&apos;t match.</p>
          )}
        </div>
        <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={submitting || !canSubmit}>
          {submitting ? "Setting password..." : "Set password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
