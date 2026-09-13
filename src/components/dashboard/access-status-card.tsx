import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Credential } from "@/lib/types";

function daysLeft(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function AccessStatusCard({ credential }: { credential: Credential | null }) {
  const state = !credential
    ? { label: "Pending", icon: ShieldQuestion, tone: "text-muted-foreground", badge: "outline" as const, box: "bg-muted" }
    : credential.status === "active"
      ? { label: "Active", icon: ShieldCheck, tone: "text-success", badge: "outline" as const, box: "bg-success/10" }
      : {
          label: credential.status === "suspended" ? "Suspended" : "Expired",
          icon: ShieldAlert,
          tone: "text-destructive",
          badge: "outline" as const,
          box: "bg-destructive/10",
        };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Access Status</CardTitle>
        {credential && (
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
          <div>
            <p className={cn("font-semibold", state.tone)}>
              {credential ? `Your credential is ${state.label.toLowerCase()}` : "Awaiting approval"}
            </p>
            {credential ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Valid until <span className="font-medium text-foreground">{formatDate(credential.expiresAt)}</span>.
                You have <span className="font-medium text-success">{daysLeft(credential.expiresAt)} days</span> left.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll activate your credential as soon as it&apos;s approved.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
