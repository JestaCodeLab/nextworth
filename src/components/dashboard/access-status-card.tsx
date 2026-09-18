import { ShieldCheck, ShieldAlert, ShieldQuestion, CreditCard } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Credential, UserStatus } from "@/lib/types";

function daysLeft(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function AccessStatusCard({
  credential,
  userStatus,
  loading,
}: {
  credential: Credential | null;
  userStatus: UserStatus;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Access Status</CardTitle>
          <Skeleton className="h-5 w-16 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const state =
    userStatus === "rejected"
      ? {
          label: "Rejected",
          icon: ShieldAlert,
          tone: "text-destructive",
          box: "bg-destructive/10",
          card: "ring-destructive/30 bg-linear-to-br from-destructive/10 via-card to-card",
        }
      : !credential
        ? {
            label: "Pending",
            icon: ShieldQuestion,
            tone: "text-primary",
            box: "bg-primary/10",
            card: "ring-primary/20 bg-linear-to-br from-primary/8 via-card to-card",
          }
        : credential.status === "pending"
          ? {
              label: "Payment required",
              icon: CreditCard,
              tone: "text-amber-500",
              box: "bg-amber-500/10",
              card: "ring-amber-500/30 bg-linear-to-br from-amber-500/10 via-card to-card",
            }
          : credential.status === "active"
            ? {
                label: "Active",
                icon: ShieldCheck,
                tone: "text-success",
                box: "bg-success/10",
                card: "ring-success/30 bg-linear-to-br from-success/10 via-card to-card",
              }
            : {
                label: credential.status === "suspended" ? "Suspended" : "Expired",
                icon: ShieldAlert,
                tone: "text-destructive",
                box: "bg-destructive/10",
                card: "ring-destructive/30 bg-linear-to-br from-destructive/10 via-card to-card",
              };

  return (
    <Card className={state.card}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Access Status</CardTitle>
        {(credential || userStatus === "rejected") && (
          <Badge variant="outline" className={cn("uppercase", state.tone)}>
            {state.label}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("flex items-start gap-3 rounded-lg p-4", state.box)}>
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background", state.tone)}>
            <state.icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className={cn("font-semibold", state.tone)}>
              {userStatus === "rejected"
                ? "Verification rejected"
                : credential
                  ? `Your credential is ${state.label.toLowerCase()}`
                  : "Awaiting approval"}
            </p>
            {userStatus === "rejected" ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Please resubmit your documents for review.{" "}
                <Link href="/credential" className="font-medium text-primary hover:underline">
                  Resubmit now
                </Link>
              </p>
            ) : credential?.status === "active" && credential.expiresAt ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Valid until <span className="font-medium text-foreground">{formatDate(credential.expiresAt)}</span>.
                You have <span className="font-medium text-success">{daysLeft(credential.expiresAt)} days</span> left.
              </p>
            ) : credential?.status === "pending" ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your identity is verified — pay the annual card fee to unlock your QR code and Member ID.
                </p>
                <Button
                  size="sm"
                  className="mt-3 gap-2 bg-amber-500 text-white hover:bg-amber-500/90"
                  render={<Link href="/credential" />}
                  nativeButton={false}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Make Payment
                </Button>
              </>
            ) : credential ? (
              <p className="mt-1 text-sm text-muted-foreground">Contact support for help restoring access.</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll activate your credential as soon as your documents are approved.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
