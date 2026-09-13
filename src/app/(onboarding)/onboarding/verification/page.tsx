"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FileDropzone } from "@/components/onboarding/file-dropzone";
import { apiFetch, ApiError } from "@/lib/api";
import { useSession } from "@/hooks/use-session";

export default function OnboardingVerificationPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [country, setCountry] = useState("GH");
  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);

  const canSubmit = Boolean(dob && country && photo && document);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await apiFetch("/users/me/verification", {
        method: "PATCH",
        body: formData,
      });
      await refresh();
      toast.success("Verification submitted.");
      router.push("/onboarding/welcome");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleContinueLater() {
    setSigningOut(true);
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      toast.info("Signed out — sign back in anytime to pick up where you left off.");
      router.push("/sign-in");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't sign you out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your identity</CardTitle>
        <CardDescription>
          Select your country and upload a photo and ID so we can issue your Nexworth credential.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="border-input flex h-11 w-full cursor-pointer rounded-lg border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="GH">Ghana</option>
              <option value="UK">United Kingdom</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Photo (for your credential)</Label>
            <FileDropzone
              name="photo"
              accept="image/*"
              description="PNG or JPG, up to 10MB"
              onFileChange={setPhoto}
            />
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

          <Button type="submit" className="w-full" disabled={submitting || !canSubmit}>
            {submitting ? "Submitting..." : "Continue"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              type="button"
              className="w-full cursor-pointer text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Continue later
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Continue later?</AlertDialogTitle>
                <AlertDialogDescription>
                  If your documents aren&apos;t ready yet, that&apos;s fine — you&apos;ll be signed out now, and
                  picking up right here next time you sign in.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay</AlertDialogCancel>
                <AlertDialogAction onClick={handleContinueLater} disabled={signingOut}>
                  {signingOut ? "Signing out..." : "Sign out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </CardContent>
    </Card>
  );
}
