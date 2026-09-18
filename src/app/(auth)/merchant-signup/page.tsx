"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/auth/icon-input";
import { PhoneInput } from "@/components/phone-input";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { MERCHANT_CATEGORIES } from "@/lib/merchant-categories";

type Market = "GH" | "UK";

interface MerchantSignupForm {
  country: Market | "";
  name: string;
  category: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  mapsUrl: string;
  password: string;
  confirmPassword: string;
}

const emptyForm: MerchantSignupForm = {
  country: "",
  name: "",
  category: "",
  description: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  city: "",
  mapsUrl: "",
  password: "",
  confirmPassword: "",
};

const marketOptions: { value: Market; label: string; hint: string }[] = [
  { value: "GH", label: "Ghana", hint: "+233" },
  { value: "UK", label: "United Kingdom", hint: "+44" },
];

const TOTAL_STEPS = 4;

export default function MerchantSignupPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<MerchantSignupForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof MerchantSignupForm>(key: K, value: MerchantSignupForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const step1Valid = form.country !== "";
  const step2Valid = form.name.trim().length >= 2 && form.category.trim().length >= 2;
  const step3Valid =
    /\S+@\S+\.\S+/.test(form.contactEmail) && form.contactPhone.trim().length >= 6 && form.mapsUrl.trim().length > 0;
  const step4Valid = form.password.length >= 8 && form.password === form.confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!step1Valid || !step2Valid || !step3Valid || !step4Valid || !form.country) return;

    setSubmitting(true);
    try {
      await apiFetch("/merchants/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim() || undefined,
          country: form.country,
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim(),
          password: form.password,
          location: {
            address: form.address.trim() || undefined,
            city: form.city.trim() || undefined,
            mapsUrl: form.mapsUrl.trim(),
          },
        }),
      });
      await refresh();
      router.push("/merchant-verify-contact");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Register your business</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Join Nexworth as a partner merchant and offer discounts to verified members.
      </p>

      <div className="mt-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div key={n} className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-primary" : "bg-muted")} />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">Step {step} of {TOTAL_STEPS}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Where does your business operate? *</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">This sets your contact number&apos;s country code.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {marketOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => set("country", option.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-5 text-center transition-colors",
                    form.country === option.value ? "border-primary bg-accent" : "hover:bg-muted/50",
                  )}
                >
                  <span className="text-base font-semibold">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.hint}</span>
                </button>
              ))}
            </div>
            <Button type="button" className="h-11 w-full text-base font-semibold" disabled={!step1Valid} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ms-name">Business name *</Label>
              <Input id="ms-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-category">Category *</Label>
              <select
                id="ms-category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="border-input flex h-11 w-full cursor-pointer rounded-lg border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {MERCHANT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-description">Description</Label>
              <Textarea id="ms-description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll add your discount codes inside the portal once your application is approved.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="h-11 gap-1.5" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="button" className="h-11 flex-1 text-base font-semibold" disabled={!step2Valid} onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && form.country && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ms-email">Contact email *</Label>
              <Input id="ms-email" type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-phone">Contact phone *</Label>
              <PhoneInput id="ms-phone" market={form.country} value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
              <p className="text-xs text-muted-foreground">We&apos;ll use your email or phone to verify you next.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-address">Address</Label>
              <Input id="ms-address" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-city">City</Label>
              <Input id="ms-city" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-maps">Google Maps link *</Label>
              <Input id="ms-maps" placeholder="https://maps.app.goo.gl/…" value={form.mapsUrl} onChange={(e) => set("mapsUrl", e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="h-11 gap-1.5" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="button" className="h-11 flex-1 text-base font-semibold" disabled={!step3Valid} onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ms-password">Create a password *</Label>
              <PasswordInput
                id="ms-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ms-confirm-password">Confirm password *</Label>
              <PasswordInput
                id="ms-confirm-password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
              />
              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <p className="text-xs text-destructive">Passwords don&apos;t match.</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="h-11 gap-1.5" onClick={() => setStep(3)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="h-11 flex-1 text-base font-semibold" disabled={submitting || !step4Valid}>
                {submitting ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Not a business?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
