"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ShieldCheck, Tag, Globe2, Lock, FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import { useSession } from "@/hooks/use-session";

const benefits = [
  { icon: Tag, title: "Exclusive Benefits", body: "Discounts and privileges from participating merchants." },
  { icon: Globe2, title: "Wide Network", body: "Accepted across Ghana and the UK, with more markets to come." },
  { icon: Lock, title: "Secure & Private", body: "Your documents and data are encrypted and never shown publicly." },
];

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish() {
    setSubmitting(true);
    try {
      await apiFetch("/users/me/onboarding-complete", { method: "POST" });
      await refresh();
      toast.success("You're all set!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Nexworth</CardTitle>
        <CardDescription>
          A single verified credential that unlocks discounts, services, and opportunities from trusted merchants
          across Ghana and the UK — verify once, access everywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg bg-accent/60 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-primary">
            <FileClock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Documents received — under review</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your photo and ID have been successfully submitted! Your information is now being reviewed, and we’ll notify you as soon as your credential is approved and issued. In the meantime, feel free to explore your dashboard.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          {benefits.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full" onClick={handleFinish} disabled={submitting}>
          {submitting ? "Finishing up..." : "Finish Setup"}
        </Button>
      </CardContent>
    </Card>
  );
}
