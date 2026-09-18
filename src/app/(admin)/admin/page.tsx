"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Users, IdCard, Clock, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalUsers: number;
  activeCredentials: number;
  pendingVerifications: number;
  merchants: number;
  revenueByCurrency: { currency: string; total: number }[];
  recentPayments: {
    id: string;
    userId: { id: string; name: string } | null;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    apiFetch<DashboardStats>("/admin/dashboard")
      .then(setStats)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Couldn't load dashboard stats."));
  }, []);

  const cards = [
    { label: "Total users", icon: Users, value: stats?.totalUsers, tint: "bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" },
    { label: "Active credentials", icon: IdCard, value: stats?.activeCredentials, tint: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" },
    { label: "Pending verifications", icon: Clock, value: stats?.pendingVerifications, tint: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" },
    { label: "Merchants", icon: Store, value: stats?.merchants, tint: "bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" },
  ];

  return (
    <div className="mx-auto max-w-8xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          {stats?.revenueByCurrency.length
            ? `Confirmed revenue: ${stats.revenueByCurrency.map((r) => `${r.currency} ${r.total}`).join(" · ")}`
            : "System-wide stats."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, icon: Icon, value, tint }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", tint)}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value ?? "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {!stats ? (
            <p className="px-6 py-8 text-center text-base text-muted-foreground">Loading…</p>
          ) : stats.recentPayments.length === 0 ? (
            <p className="px-6 py-8 text-center text-base text-muted-foreground">No transactions yet.</p>
          ) : (
            stats.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 px-6 py-5">
                <div>
                  <p className="text-base font-medium">{payment.userId?.name ?? "Unknown user"}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-medium">
                    {payment.currency} {payment.amount}
                  </span>
                  <Badge variant="outline" className="uppercase">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
