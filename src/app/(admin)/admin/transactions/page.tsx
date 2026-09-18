"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PaymentRow {
  id: string;
  userId: { id: string; name: string; email: string } | null;
  amount: number;
  currency: string;
  provider: string;
  providerRef?: string;
  status: "pending" | "confirmed" | "failed" | "refund-flagged";
  createdAt: string;
}

const statusTone: Record<PaymentRow["status"], string> = {
  pending: "text-amber-500",
  confirmed: "text-success",
  failed: "text-destructive",
  "refund-flagged": "text-destructive",
};

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);

  useEffect(() => {
    apiFetch<{ payments: PaymentRow[] }>("/admin/payments")
      .then((data) => setPayments(data.payments))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Couldn't load transactions."));
  }, []);

  return (
    <div className="mx-auto max-w-8xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          Every card-fee payment attempt, confirmed automatically by Paystack&apos;s webhook.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All transactions</CardTitle>
          <CardDescription>Read-only — payments are confirmed by Paystack, not by an admin action.</CardDescription>
        </CardHeader>
        <CardContent>
          {!payments ? (
            <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground" />
              <p className="text-base text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Provider ref</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.userId ? (
                        <>
                          {payment.userId.name}
                          <span className="block text-sm font-normal text-muted-foreground">{payment.userId.email}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.currency} {payment.amount}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{payment.providerRef ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("uppercase", statusTone[payment.status])}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(payment.createdAt)}</TableCell>
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
