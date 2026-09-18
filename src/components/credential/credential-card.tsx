import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Credential, SessionUser } from "@/lib/types";

interface CredentialCardProps {
  user: SessionUser;
  credential: Credential | null;
  qrSize?: number;
}

export function CredentialCard({ user, credential, qrSize = 200 }: CredentialCardProps) {
  const unlocked = credential?.status === "active";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f0a2e] p-6 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(circle at 90% 10%, oklch(0.541 0.281 293.009 / 0.5), transparent 60%)",
        }}
      />
      <div className="relative z-10 flex gap-6">
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <Image src="/nexworth_brand_logos/nexworth-logo-white.png" alt="Nexworth" width={130} height={20} />
            <p className="mt-1.5 text-xs uppercase tracking-widest text-white/50">Digital Discount Card</p>
          </div>
          <div className="mt-8 flex items-center gap-4">
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
              {unlocked ? (
                <>
                  <p className="font-mono text-sm text-violet-300">{credential.credentialCode}</p>
                  {credential.expiresAt && (
                    <p className="mt-1 text-xs text-white/50">Valid until {formatDate(credential.expiresAt)}</p>
                  )}
                </>
              ) : credential?.status === "pending" ? (
                <p className="font-mono text-sm text-violet-300">Issued after payment</p>
              ) : (
                <p className="font-mono text-sm text-violet-300">Issued after approval</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-5">
          {unlocked ? (
            <div className="flex items-center justify-center rounded-lg bg-white p-5">
              <QRCodeCanvas value={credential.qrPayload} size={qrSize} />
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-lg bg-white/10"
              style={{ height: qrSize, width: qrSize }}
            >
              <QrCode className="h-10 w-10 text-white/40" />
            </div>
          )}
          <p className="text-[10px] text-white/50">
            {unlocked ? "Show this code" : credential?.status === "pending" ? "Payment required" : "Awaiting review"}
          </p>
        </div>
      </div>
    </div>
  );
}
