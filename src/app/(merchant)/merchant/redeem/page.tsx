"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, CheckCircle2, XCircle, Clock, ShieldAlert, Percent, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { MerchantAccount, RedeemLookupResult, RedeemableOffer } from "@/lib/types";

const selectClassName =
  "border-input flex h-10 w-full cursor-pointer rounded-lg border bg-transparent px-3.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const credentialStatusMeta: Record<RedeemLookupResult["result"], { label: string; icon: typeof CheckCircle2; tone: string }> = {
  valid: { label: "Valid member", icon: CheckCircle2, tone: "text-success" },
  suspended: { label: "Suspended", icon: ShieldAlert, tone: "text-destructive" },
  expired: { label: "Membership expired", icon: Clock, tone: "text-amber-500" },
  invalid: { label: "Not recognized", icon: XCircle, tone: "text-destructive" },
};

function OfferOption({
  offer,
  selected,
  onSelect,
}: {
  offer: RedeemableOffer;
  selected: boolean;
  onSelect: () => void;
}) {
  const disabled = offer.status !== "valid";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/50",
        selected && !disabled && "border-primary bg-primary/5",
      )}
    >
      <div>
        <p className="text-sm font-medium">{offer.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          {offer.discountType === "percentage" ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
          {offer.discountValue}
          {offer.discountType === "percentage" ? "%" : ""} off
          {offer.minimumPurchaseAmount !== undefined ? ` · orders over ${offer.minimumPurchaseAmount}` : ""}
        </p>
        <p className="mt-1 font-mono text-sm text-primary">{offer.code}</p>
      </div>
      {offer.status === "expired" ? (
        <Badge variant="outline" className="shrink-0 text-destructive">
          Expired {offer.validTo ? formatDate(offer.validTo) : ""}
        </Badge>
      ) : offer.status === "not_started" ? (
        <Badge variant="outline" className="shrink-0 text-muted-foreground">
          Not started yet
        </Badge>
      ) : null}
    </button>
  );
}

export default function MerchantRedeemPage() {
  const [merchant, setMerchant] = useState<MerchantAccount | null>(null);
  const [code, setCode] = useState("");
  const [looking, setLooking] = useState(false);
  const [lookup, setLookup] = useState<RedeemLookupResult | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [amountRedeemed, setAmountRedeemed] = useState("");
  const [locationId, setLocationId] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    apiFetch<{ merchant: MerchantAccount }>("/merchant/me")
      .then((data) => setMerchant(data.merchant))
      .catch(() => {});
  }, []);

  function resetLookup() {
    setLookup(null);
    setSelectedOfferId(null);
    setAmountRedeemed("");
    setLocationId("");
  }

  async function handleLookup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;

    setLooking(true);
    resetLookup();
    try {
      const data = await apiFetch<RedeemLookupResult>(`/merchant/redeem-lookup/${encodeURIComponent(code.trim())}`);
      setLookup(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't look up this member.");
    } finally {
      setLooking(false);
    }
  }

  const needsLocation = (merchant?.locations.length ?? 0) > 1;
  const canRedeem =
    lookup?.result === "valid" &&
    !!selectedOfferId &&
    Number(amountRedeemed) > 0 &&
    (!needsLocation || locationId.length > 0);

  async function handleRedeem() {
    if (!lookup || !selectedOfferId) return;

    setRedeeming(true);
    try {
      await apiFetch("/merchant/redeem", {
        method: "POST",
        body: JSON.stringify({
          credentialId: lookup.credential.id,
          offerId: selectedOfferId,
          amountRedeemed: Number(amountRedeemed),
          locationId: needsLocation ? locationId : undefined,
        }),
      });
      toast.success(`Redeemed for ${lookup.holder.name}.`);
      setCode("");
      resetLookup();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't record this redemption.");
    } finally {
      setRedeeming(false);
    }
  }

  const statusMeta = lookup ? credentialStatusMeta[lookup.result] : null;
  const StatusIcon = statusMeta?.icon;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Redeem</h1>
        <p className="mt-1 text-sm text-muted-foreground">Look up a member by their member ID to apply a discount.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleLookup} className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter member ID (e.g. NXW-3K9ZP2)"
              className="font-mono"
            />
            <Button type="submit" disabled={looking || !code.trim()} className="gap-2">
              <Search className="h-4 w-4" />
              {looking ? "Looking up..." : "Look up"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {lookup && statusMeta && StatusIcon && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={lookup.holder.photoUrl ?? undefined} alt={lookup.holder.name} />
                  <AvatarFallback className="bg-accent text-2xl text-accent-foreground">{initials(lookup.holder.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{lookup.holder.name}</CardTitle>
                  <CardDescription>Member</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={cn("gap-1.5 uppercase", statusMeta.tone)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusMeta.label}
              </Badge>
            </div>
          </CardHeader>

          {lookup.result === "valid" && (
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Select a discount code</Label>
                {lookup.offers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You have no discount codes set up yet — add one in Discounts.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lookup.offers.map((offer) => (
                      <OfferOption
                        key={offer.id}
                        offer={offer}
                        selected={selectedOfferId === offer.id}
                        onSelect={() => setSelectedOfferId(offer.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {selectedOfferId && (
                <>
                  <div className="space-y-2 border-t pt-5">
                    <Label>Amount redeemed *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={amountRedeemed}
                      onChange={(e) => setAmountRedeemed(e.target.value)}
                      placeholder="The value of the discount given, not the sale total"
                    />
                    <p className="text-xs text-muted-foreground">The dollar value of the discount you gave — not the total sale.</p>
                  </div>

                  {needsLocation && merchant && (
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className={selectClassName}>
                        <option value="" disabled>
                          Select a location
                        </option>
                        {merchant.locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button className="w-full" disabled={!canRedeem || redeeming} onClick={handleRedeem}>
                    {redeeming ? "Redeeming..." : "Redeemed"}
                  </Button>
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
