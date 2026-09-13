"use client";

import { useRef } from "react";
import { toast } from "react-toastify";
import { Download, User, IdCard, Mail, Phone, Calendar, MapPin, CheckCircle2, Pencil, AlertTriangle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CredentialCard } from "@/components/credential/credential-card";
import { useSession } from "@/hooks/use-session";
import { useCredential } from "@/hooks/use-credential";
import { formatDate } from "@/lib/format";

const cardUsage = [
  "Present your QR code or Member ID at checkout.",
  "Discounts are applied instantly.",
  "Card is non-transferable.",
  "Valid only within the validity period.",
];

function notAvailable() {
  toast.info("Editing account details isn't available yet in this build.");
}

export default function CredentialPage() {
  const { user } = useSession();
  const { credential } = useCredential();
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);

  if (!user) return null;

  function handleDownload() {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `nexworth-credential-${credential?.credentialCode ?? "qr"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const details = [
    { icon: User, label: "Full Name", value: user.name },
    { icon: IdCard, label: "Member ID", value: credential?.credentialCode ?? "Issued after approval" },
    { icon: Mail, label: "Email Address", value: user.email },
    { icon: Phone, label: "Phone Number", value: user.phone ?? "—" },
    { icon: Calendar, label: "Date of Birth", value: user.dob ? formatDate(user.dob) : "—" },
    { icon: MapPin, label: "Location", value: user.country === "UK" ? "United Kingdom" : "Ghana" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Credential</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage your digital discount card details.</p>
        </div>
        {credential && (
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download QR
          </Button>
        )}
      </div>

      {credential && (
        <div className="hidden">
          <QRCodeCanvas ref={downloadCanvasRef} value={credential.qrPayload} size={512} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CredentialCard user={user} credential={credential} qrSize={128} />

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
              <Button variant="outline" className="gap-2" onClick={notAvailable}>
                <Pencil className="h-4 w-4" />
                Edit Information
              </Button>
              <Button
                variant="ghost"
                className="gap-2 text-destructive hover:text-destructive"
                render={<a href="/support" />}
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
            {details.map(({ icon: Icon, label, value }) => (
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
                <button
                  onClick={notAvailable}
                  className="shrink-0 cursor-pointer text-xs font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
