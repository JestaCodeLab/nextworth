"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Wallet, CheckCircle2, XCircle, MessageSquare, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SmsLogRow {
  id: string;
  recipientPhone: string;
  recipientName?: string;
  message: string;
  status: "sent" | "failed";
  error?: string;
  createdAt: string;
}

interface SmsOverview {
  configured: boolean;
  wallet: { balance: number | null; currency?: string; error?: string };
  totalSent: number;
  totalFailed: number;
  logs: SmsLogRow[];
}

export default function AdminDeliveryReportPage() {
  const [overview, setOverview] = useState<SmsOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function loadOverview() {
    return apiFetch<SmsOverview>("/admin/sms/overview")
      .then(setOverview)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Couldn't load SMS overview."));
  }

  useEffect(() => {
    loadOverview();
  }, []);

  async function handleRefreshBalance() {
    setRefreshing(true);
    try {
      await loadOverview();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="mx-auto max-w-8xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Report</h1>
        <p className="mt-1.5 text-base text-muted-foreground">Wallet balance and delivery history for outgoing SMS.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm font-medium text-muted-foreground">Wallet balance</CardTitle>
              <button
                type="button"
                onClick={handleRefreshBalance}
                disabled={refreshing}
                aria-label="Refresh wallet balance"
                className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              </button>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {!overview ? (
              <p className="text-3xl font-bold">—</p>
            ) : overview.wallet.balance !== null ? (
              <p className="text-3xl font-bold">
                {overview.wallet.balance} <span className="text-lg font-medium text-muted-foreground">credits</span>
              </p>
            ) : (
              <p className="text-base text-muted-foreground">{overview.wallet.error ?? "Unavailable"}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview ? overview.totalSent : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <XCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview ? overview.totalFailed : "—"}</p>
          </CardContent>
        </Card>
      </div>

      {overview && !overview.configured && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-5 text-base text-amber-600">
            FlockText isn&apos;t configured yet — add <code>FLOCKTEXT_API_KEY</code> and{" "}
            <code>FLOCKTEXT_SENDER_ID</code> to the API&apos;s environment to enable SMS sending and a live wallet
            balance.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Delivery report</CardTitle>
          <CardDescription>Most recent 100 SMS send attempts, across all communications.</CardDescription>
        </CardHeader>
        <CardContent>
          {!overview ? (
            <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
          ) : overview.logs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
              <p className="text-base text-muted-foreground">No SMS sent yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <p className="font-medium">{log.recipientName ?? "—"}</p>
                      <p className="text-sm text-muted-foreground">{log.recipientPhone}</p>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{log.message}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("uppercase", log.status === "sent" ? "text-success" : "text-destructive")}
                      >
                        {log.status}
                      </Badge>
                      {log.status === "failed" && log.error && (
                        <p className="mt-1 text-sm text-muted-foreground">{log.error}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
