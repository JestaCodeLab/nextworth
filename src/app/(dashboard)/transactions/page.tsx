"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Receipt, Store, Percent, DollarSign, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Redemption, Payment, PaymentStatus } from "@/lib/types";

const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  pending: "secondary",
  failed: "destructive",
  "refund-flagged": "outline",
};

export default function TransactionsPage() {
  const [tab, setTab] = useState<"redemptions" | "payments">("redemptions");
  const [redemptions, setRedemptions] = useState<Redemption[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    apiFetch<{ redemptions: Redemption[] }>("/transactions")
      .then((data) => setRedemptions(data.redemptions))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Couldn't load your transactions.");
        setRedemptions([]);
      });

    apiFetch<{ payments: Payment[] }>("/payments/me")
      .then((data) => setPayments(data.payments))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Couldn't load your payments.");
        setPayments([]);
      });
  }, []);

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">A record of your redemptions and card payments.</p>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={tab} onValueChange={(value) => setTab(value as "redemptions" | "payments")}>
            <TabsList>
              <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
              <TabsTrigger value="payments">Card payments</TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === "redemptions" ? (
            <CardDescription>Every time a merchant applied your discount, it shows up here.</CardDescription>
          ) : (
            <CardDescription>Every card payment you've made for your credential shows up here.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {tab === "redemptions" ? (
            !redemptions ? (
              <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
            ) : redemptions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground" />
                <p className="text-base text-muted-foreground">No redemptions yet — they&apos;ll show up here once a merchant redeems your discount.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Amount redeemed</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-1.5">
                          <Store className="h-3.5 w-3.5 text-muted-foreground" />
                          {redemption.merchantName}
                          {redemption.locationLabel ? ` · ${redemption.locationLabel}` : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{redemption.offerTitle}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {redemption.discountType === "percentage" ? (
                            <Percent className="h-3.5 w-3.5" />
                          ) : (
                            <DollarSign className="h-3.5 w-3.5" />
                          )}
                          {redemption.discountValue}
                          {redemption.discountType === "percentage" ? "%" : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{redemption.amountRedeemed}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(redemption.redeemedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : !payments ? (
            <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <p className="text-base text-muted-foreground">No card payments yet — they&apos;ll show up here once you pay your card fee.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        {payment.providerRef ?? payment.id}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.currency} {payment.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PAYMENT_STATUS_VARIANT[payment.status]} className="capitalize">
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
