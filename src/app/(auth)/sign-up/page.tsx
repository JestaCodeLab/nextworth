"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { User, Mail, Phone, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IconInput, PasswordInput } from "@/components/auth/icon-input";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import type { SessionUser } from "@/lib/types";

const passwordRules = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

const TOTAL_STEPS = 2;

export default function SignUpPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordValid = passwordRules.every((rule) => rule.test(password));
  const step1Valid = Boolean(firstName.trim() && lastName.trim() && email.trim() && phone.trim());
  const step2Valid = Boolean(passwordValid && confirmPassword && password === confirmPassword && agreed);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!step1Valid || !step2Valid) return;

    setSubmitting(true);
    try {
      await apiFetch<{ user: SessionUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email,
          password,
          phone,
        }),
      });
      await refresh();
      toast.success("Account created — let's verify your identity.");
      router.push("/onboarding/verification");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Join Nexworth and start accessing exclusive opportunities.
      </p>

      <div className="mt-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div key={n} className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-primary" : "bg-muted")} />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        Step {step} of {TOTAL_STEPS}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <IconInput
                  icon={User}
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <IconInput
                  icon={User}
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <IconInput
                icon={Mail}
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <IconInput
                icon={Phone}
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button
              type="button"
              className="h-11 w-full text-base font-semibold"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ul className="grid gap-1 pt-1">
                {passwordRules.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li
                      key={rule.key}
                      className={cn("flex items-center gap-1.5 text-xs", met ? "text-success" : "text-muted-foreground")}
                    >
                      <Check className={cn("h-3.5 w-3.5", met ? "opacity-100" : "opacity-30")} />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
              <span>
                I agree to the <span className="text-primary">Terms of Use</span> and{" "}
                <span className="text-primary">Privacy Policy</span>
              </span>
            </label>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="h-11 gap-1.5" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="h-11 flex-1 text-base font-semibold" disabled={submitting || !step2Valid}>
                {submitting ? "Creating account..." : "Create Account"}
              </Button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
