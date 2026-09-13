import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Credential, SessionUser } from "@/lib/types";

const statusStyles: Record<Credential["status"], string> = {
  active: "bg-success/20 text-success border-success/30",
  pending: "bg-white/10 text-white border-white/20",
  suspended: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  expired: "bg-white/10 text-white/60 border-white/20",
};

const statusLabel: Record<Credential["status"], string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
  expired: "Expired",
};

interface CredentialCardProps {
  user: SessionUser;
  credential: Credential | null;
  qrSize?: number;
}

export function CredentialCard({ user, credential, qrSize = 96 }: CredentialCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f0a2e] p-6 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(circle at 90% 10%, oklch(0.541 0.281 293.009 / 0.5), transparent 60%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <Image src="/nexworth_brand_logos/nexworth-logo-white.png" alt="Nexworth" width={130} height={20} />
          <p className="mt-1.5 text-xs uppercase tracking-widest text-white/50">Digital Discount Card</p>
        </div>
        <Badge className={cn("capitalize", credential ? statusStyles[credential.status] : statusStyles.pending)}>
          {credential ? statusLabel[credential.status] : "Pending Verification"}
        </Badge>
      </div>

      <div className="relative z-10 mt-8 flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.photoUrl && (
            <Image
              src={user.photoUrl}
              alt={user.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-white/50">Member ID</p>
            {credential ? (
              <>
                <p className="font-mono text-sm text-violet-300">{credential.credentialCode}</p>
                <p className="mt-1 text-xs text-white/50">Valid until {formatDate(credential.expiresAt)}</p>
              </>
            ) : (
              <p className="font-mono text-sm text-violet-300">Issued after approval</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          {credential ? (
            <div className="rounded-lg bg-white p-2">
              <QRCodeCanvas value={credential.qrPayload} size={qrSize} />
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-lg bg-white/10"
              style={{ height: qrSize, width: qrSize }}
            >
              <QrCode className="h-8 w-8 text-white/40" />
            </div>
          )}
          <p className="text-[10px] text-white/50">{credential ? "Show this code" : "Awaiting review"}</p>
        </div>
      </div>
    </div>
  );
}
