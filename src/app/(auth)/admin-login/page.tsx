"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconInput, PasswordInput } from "@/components/auth/icon-input";
import { apiFetch, ApiError } from "@/lib/api";
import { onboardingStepPath } from "@/lib/onboarding";
import { useSession } from "@/hooks/use-session";
import type { SessionUser } from "@/lib/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(email && password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const { user } = await apiFetch<{ user: SessionUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();

      if (user.role !== "admin") {
        toast.info("That account isn't an admin — taking you to your dashboard instead.");
        router.push(onboardingStepPath(user.onboardingStep));
        return;
      }

      router.push("/admin");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-500">
        <ShieldCheck className="h-4 w-4" />
        Admin console
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Admin sign in</h2>
      <p className="mt-1 text-sm text-muted-foreground">Sign in with your Nexworth admin credentials.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="admin-email">Email address</Label>
          <IconInput
            icon={Mail}
            id="admin-email"
            name="email"
            type="email"
            placeholder="Enter your admin email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <PasswordInput
            id="admin-password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={submitting || !canSubmit}>
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Not an admin?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Go to user sign in
        </Link>
      </p>
    </div>
  );
}
