"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PricingRow {
  market: "GH" | "UK";
  amount: number;
  currency: string;
}

const marketLabel: Record<PricingRow["market"], string> = { GH: "Ghana", UK: "United Kingdom" };
const marketTint: Record<PricingRow["market"], string> = {
  GH: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  UK: "bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
};

function PricingCard({ initial, onSaved }: { initial: PricingRow; onSaved: () => void }) {
  const [amount, setAmount] = useState(String(initial.amount));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch(`/admin/pricing/${initial.market}`, {
        method: "PATCH",
        body: JSON.stringify({ amount: parsedAmount, currency: initial.currency }),
      });
      toast.success(`${marketLabel[initial.market]} pricing updated.`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update pricing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{marketLabel[initial.market]}</CardTitle>
          <CardDescription>Annual card fee charged via Paystack, in {initial.currency}.</CardDescription>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", marketTint[initial.market])}>
          <Coins className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`pricing-${initial.market}`}>Amount ({initial.currency})</Label>
          <Input
            id={`pricing-${initial.market}`}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const [pricing, setPricing] = useState<PricingRow[] | null>(null);

  function load() {
    apiFetch<{ pricing: PricingRow[] }>("/admin/pricing")
      .then((data) => setPricing(data.pricing))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Couldn't load pricing."));
  }

  useEffect(load, []);

  return (
    <div className="mx-auto max-w-8xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1.5 text-base text-muted-foreground">Market-specific pricing for the annual card fee.</p>
      </div>

      {!pricing ? (
        <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {pricing.map((row) => (
            <PricingCard key={row.market} initial={row} onSaved={load} />
          ))}
        </div>
      )}
    </div>
  );
}
