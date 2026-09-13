"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

type VerificationResult = "valid" | "suspended" | "expired" | "invalid";

interface VerifyResponse {
  result: VerificationResult;
  holder: { name: string; photoUrl: string | null };
  credential: { status: string; expiresAt: string };
}

const resultCopy: Record<VerificationResult, { label: string; tone: string; icon: typeof ShieldCheck }> = {
  valid: { label: "Active", tone: "bg-success/10 text-success", icon: ShieldCheck },
  suspended: { label: "Suspended", tone: "bg-amber-100 text-amber-600", icon: ShieldAlert },
  expired: { label: "Expired", tone: "bg-amber-100 text-amber-600", icon: ShieldAlert },
  invalid: { label: "Invalid", tone: "bg-destructive/10 text-destructive", icon: ShieldX },
};

export default function VerifyPage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = use(params);
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    apiFetch<VerifyResponse>(`/verify/${credentialId}`)
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        }
      });
  }, [credentialId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0a2e] p-6 text-white">
      <Image src="/nexworth_brand_logos/nexworth-logo-white.png" alt="Nexworth" width={160} height={25} priority />

      <div className="mt-10 w-full max-w-sm rounded-2xl bg-white p-8 text-center text-[#0f0a2e] shadow-xl">
        {notFound ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldX className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-lg font-semibold">Credential not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">This credential ID doesn&apos;t match any Nexworth account.</p>
          </>
        ) : !data ? (
          <p className="py-6 text-sm text-muted-foreground">Checking…</p>
        ) : (
          <>
            {data.holder.photoUrl && (
              <Image
                src={data.holder.photoUrl}
                alt={data.holder.name}
                width={80}
                height={80}
                className="mx-auto h-20 w-20 rounded-full object-cover"
              />
            )}
            <div
              className={`mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${resultCopy[data.result].tone}`}
            >
              {(() => {
                const Icon = resultCopy[data.result].icon;
                return <Icon className="h-4 w-4" />;
              })()}
              {resultCopy[data.result].label}
            </div>
            <h1 className="mt-3 text-lg font-semibold">{data.holder.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Expires {formatDate(data.credential.expiresAt)}</p>
          </>
        )}
      </div>
    </div>
  );
}
