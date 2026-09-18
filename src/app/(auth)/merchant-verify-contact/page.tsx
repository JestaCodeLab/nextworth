"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Smartphone, Mail, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { PageLoader } from "@/components/page-loader";

type Channel = "phone" | "email";
type WizardStep = "channel" | "code";

export default function MerchantVerifyContactPage() {
  const router = useRouter();
  const { user, loading, refresh } = useSession();
  const [step, setStep] = useState<WizardStep>("channel");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [maskedDestination, setMaskedDestination] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (loading) return <PageLoader />;
  if (!user) {
    router.replace("/sign-in");
    return <PageLoader />;
  }
  if (user.role !== "merchant") {
    router.replace("/dashboard");
    return <PageLoader />;
  }
  if (user.merchantContactVerified) {
    router.replace("/merchant/redeem");
    return <PageLoader />;
  }

  async function chooseChannel(nextChannel: Channel) {
    setSending(true);
    try {
      const data = await apiFetch<{ channel: Channel; maskedDestination: string }>("/merchant/verification/send", {
        method: "POST",
        body: JSON.stringify({ channel: nextChannel }),
      });
      setChannel(data.channel);
      setMaskedDestination(data.maskedDestination);
      setCode("");
      setStep("code");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send a code. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.trim().length === 0) return;

    setVerifying(true);
    try {
      await apiFetch("/merchant/verification/confirm", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() }),
      });
      await refresh();
      toast.success("You're verified — welcome to your portal.");
      router.push("/merchant/redeem");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't verify that code.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Verify your business</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One quick step before you enter your portal — confirm you own the contact details on file.
      </p>

      {step === "channel" && (
        <div className="mt-8 space-y-3">
          <Label>Send my code by</Label>
          <button
            type="button"
            disabled={sending}
            onClick={() => chooseChannel("phone")}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
              sending && "cursor-not-allowed opacity-60",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Text message</p>
              <p className="text-xs text-muted-foreground">Send a code to your contact phone number.</p>
            </div>
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => chooseChannel("email")}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
              sending && "cursor-not-allowed opacity-60",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">Send a code to your contact email address.</p>
            </div>
          </button>
          {sending && <p className="text-center text-sm text-muted-foreground">Sending code...</p>}
        </div>
      )}

      {step === "code" && (
        <form onSubmit={handleConfirm} className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the code we sent {channel === "phone" ? "via text to" : "via email to"}{" "}
            <span className="font-medium text-foreground">{maskedDestination}</span>.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="verify-code">Verification code</Label>
            <Input
              id="verify-code"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="text-center text-lg tracking-[0.3em]"
            />
          </div>
          <Button type="submit" className="h-11 w-full text-base font-semibold" disabled={verifying || code.trim().length === 0}>
            {verifying ? "Verifying..." : "Verify"}
          </Button>
          <button
            type="button"
            onClick={() => setStep("channel")}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 py-1 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Change verification method
          </button>
        </form>
      )}
    </div>
  );
}
