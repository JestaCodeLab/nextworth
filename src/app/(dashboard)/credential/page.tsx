"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Script from "next/script";
import {
  Download,
  User,
  IdCard,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  Pencil,
  AlertTriangle,
  CreditCard,
  ShieldAlert,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { FileDropzone } from "@/components/onboarding/file-dropzone";
import { CredentialCard } from "@/components/credential/credential-card";
import { ActivationTimeline } from "@/components/credential/activation-timeline";
import { useSession } from "@/hooks/use-session";
import { useCredential } from "@/hooks/use-credential";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

declare global {
  interface Window {
    PaystackPop?: {
      setup(options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }): { openIframe(): void };
    };
  }
}

interface InitializeResponse {
  reference: string;
  amount: number;
  currency: string;
  email: string;
  publicKey: string;
}

function PaymentRequiredCard({ onSuccess }: { onSuccess: () => void }) {
  const [pricing, setPricing] = useState<{ amount: number; currency: string } | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ amount: number; currency: string }>("/payments/pricing/me")
      .then((data) => {
        if (!cancelled) setPricing(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleVerify(reference: string) {
    try {
      const result = await apiFetch<{ confirmed: boolean }>(`/payments/verify/${reference}`, { method: "POST" });
      if (result.confirmed) {
        toast.success("Payment confirmed — your card is now active.");
        onSuccess();
      } else {
        toast.info("Still confirming your payment — this can take a moment. Refresh shortly if it doesn't update.");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't confirm payment. Please refresh in a moment.");
    } finally {
      setPaying(false);
    }
  }

  async function handlePay() {
    if (!window.PaystackPop) {
      toast.error("Payment isn't ready yet — please try again in a moment.");
      return;
    }

    setPaying(true);
    try {
      const data = await apiFetch<InitializeResponse>("/payments/initialize", { method: "POST" });
      window.PaystackPop.setup({
        key: data.publicKey,
        email: data.email,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        ref: data.reference,
        onClose: () => setPaying(false),
        callback: (response) => {
          handleVerify(response.reference);
        },
      }).openIframe();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't start payment. Please try again.");
      setPaying(false);
    }
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Payment required</CardTitle>
            <CardDescription>
              Your identity is verified — pay the annual card fee to unlock your QR code and Member ID.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePay} disabled={paying || !pricing}>
            {paying ? "Processing..." : pricing ? `Pay ${pricing.currency} ${pricing.amount} with Paystack` : "Loading..."}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function ResubmitVerificationSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, refresh } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [country, setCountry] = useState<"GH" | "UK">(user?.country ?? "GH");
  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);

  const canSubmit = Boolean(dob && country && photo && document);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await apiFetch("/users/me/verification", { method: "PATCH", body: formData });
      await refresh();
      toast.success("Documents resubmitted for review.");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Resubmit Documents</SheetTitle>
          <SheetDescription>Upload a new photo and ID document for review.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4" noValidate>
          <div className="space-y-1.5">
            <Label>Date of birth</Label>
            <DatePicker
              name="dob"
              value={dob}
              onChange={setDob}
              placeholder="Select your date of birth"
              disabled={{ after: new Date() }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resubmit-country">Country</Label>
            <select
              id="resubmit-country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value as "GH" | "UK")}
              className="border-input flex h-11 w-full cursor-pointer rounded-lg border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="GH">Ghana</option>
              <option value="UK">United Kingdom</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Photo (for your credential)</Label>
            <FileDropzone name="photo" accept="image/*" description="PNG or JPG, up to 10MB" onFileChange={setPhoto} />
          </div>
          <div className="space-y-1.5">
            <Label>ID or student document</Label>
            <FileDropzone
              name="document"
              accept="image/*,.pdf"
              description="Government-issued photo ID, student card, or a document confirming your date of birth"
              onFileChange={setDocument}
            />
          </div>
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Submitting..." : "Resubmit"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function RejectedVerificationCard({ reason }: { reason?: string }) {
  const [resubmitOpen, setResubmitOpen] = useState(false);

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Verification rejected</CardTitle>
            <CardDescription>
              {reason ?? "Your submitted documents couldn't be verified. Please resubmit with clearer or updated documents."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => setResubmitOpen(true)}>
            Resubmit documents
          </Button>
        </CardContent>
      </Card>
      <ResubmitVerificationSheet open={resubmitOpen} onOpenChange={setResubmitOpen} />
    </>
  );
}

const cardUsage = [
  "Present your QR code or Member ID at checkout.",
  "Discounts are applied instantly.",
  "Card is non-transferable.",
  "Valid only within the validity period.",
];

function EditProfileSheet({
  open,
  onOpenChange,
  name: initialName,
  phone: initialPhone,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  phone: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setPhone(initialPhone);
    }
  }, [open, initialName, initialPhone]);

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 6;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      toast.success("Profile updated.");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update your profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>Update your name and phone number. Member ID, email, date of birth, and location can&apos;t be changed here.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-5">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone number</Label>
            <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function CredentialPage() {
  const { user, refresh: refreshSession } = useSession();
  const { credential, refresh: refreshCredential } = useCredential();
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);
  const unlocked = credential?.status === "active";
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  if (!user) return null;

  function handleDownload() {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `nexworth-credential-${credential?.credentialCode ?? "qr"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const memberId = unlocked
    ? credential.credentialCode
    : credential?.status === "pending"
      ? "Issued after payment"
      : user.status === "rejected"
        ? "Issued after resubmission"
        : "Issued after approval";

  const details = [
    { icon: User, label: "Full Name", value: user.name, editable: true },
    { icon: IdCard, label: "Member ID", value: memberId, editable: false },
    { icon: Mail, label: "Email Address", value: user.email, editable: false },
    { icon: Phone, label: "Phone Number", value: user.phone ?? "—", editable: true },
    { icon: Calendar, label: "Date of Birth", value: user.dob ? formatDate(user.dob) : "—", editable: false },
    { icon: MapPin, label: "Location", value: user.country === "UK" ? "United Kingdom" : "Ghana", editable: false },
  ];

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Credential</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your digital discount card details.</p>
        </div>
        {unlocked && (
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download QR
          </Button>
        )}
      </div>

      {unlocked && (
        <div className="hidden">
          <QRCodeCanvas ref={downloadCanvasRef} value={credential.qrPayload} size={512} />
        </div>
      )}

      <ActivationTimeline user={user} credential={credential} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {user.status === "rejected" ? (
            <RejectedVerificationCard reason={user.rejectionReason} />
          ) : (
            <CredentialCard user={user} credential={credential} />
          )}

          {credential?.status === "pending" && <PaymentRequiredCard onSuccess={refreshCredential} />}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Card Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cardUsage.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need to make changes?</CardTitle>
              <CardDescription>You can update your details anytime.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" onClick={() => setEditProfileOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit Information
              </Button>
              <Button
                variant="ghost"
                className="gap-2 text-destructive hover:text-destructive"
                render={<a href="/support" />}
                nativeButton={false}
              >
                <AlertTriangle className="h-4 w-4" />
                Report an Issue
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Card Details</CardTitle>
            <CardDescription>View and update the information on your discount card.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {details.map(({ icon: Icon, label, value, editable }) => (
              <div key={label} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                </div>
                {editable && (
                  <button
                    onClick={() => setEditProfileOpen(true)}
                    className="shrink-0 cursor-pointer text-xs font-medium text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <EditProfileSheet
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        name={user.name}
        phone={user.phone ?? ""}
        onSaved={refreshSession}
      />
    </div>
  );
}
