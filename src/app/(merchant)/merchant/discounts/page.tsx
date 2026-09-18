"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Tag, Plus, Pencil, Trash2, Percent, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useSession } from "@/hooks/use-session";
import type { MerchantOffer, DiscountType } from "@/lib/types";

const selectClassName =
  "border-input flex h-10 w-full cursor-pointer rounded-lg border bg-transparent px-3.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface OfferFormState {
  title: string;
  discountType: DiscountType;
  discountValue: string;
  code: string;
  minimumPurchaseAmount: string;
  validTo: string;
}

const emptyForm: OfferFormState = {
  title: "",
  discountType: "percentage",
  discountValue: "",
  code: "",
  minimumPurchaseAmount: "",
  validTo: "",
};

function offerStatus(offer: MerchantOffer): { label: string; tone: string } {
  if (!offer.isActive) return { label: "Retired", tone: "text-muted-foreground" };
  if (offer.validTo && new Date(offer.validTo).getTime() < Date.now()) {
    return { label: "Expired", tone: "text-destructive" };
  }
  return { label: "Active", tone: "text-success" };
}

function buildPayload(form: OfferFormState) {
  return {
    title: form.title.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    code: form.code.trim(),
    minimumPurchaseAmount: form.minimumPurchaseAmount.trim() ? Number(form.minimumPurchaseAmount) : undefined,
    validTo: form.validTo ? new Date(form.validTo).toISOString() : undefined,
  };
}

function OfferFormSheet({
  offer,
  open,
  onOpenChange,
  onSaved,
}: {
  offer: MerchantOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<OfferFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && offer) {
      setForm({
        title: offer.title,
        discountType: offer.discountType,
        discountValue: String(offer.discountValue),
        code: offer.code ?? "",
        minimumPurchaseAmount: offer.minimumPurchaseAmount !== undefined ? String(offer.minimumPurchaseAmount) : "",
        validTo: offer.validTo ? offer.validTo.slice(0, 10) : "",
      });
    } else if (open) {
      setForm(emptyForm);
    }
  }

  function set<K extends keyof OfferFormState>(key: K, value: OfferFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const canSubmit = form.title.trim().length >= 2 && form.code.trim().length >= 2 && Number(form.discountValue) > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      if (offer) {
        await apiFetch(`/merchant/offers/${offer.id}`, { method: "PATCH", body: JSON.stringify(buildPayload(form)) });
        toast.success("Discount code updated.");
      } else {
        await apiFetch("/merchant/offers", { method: "POST", body: JSON.stringify(buildPayload(form)) });
        toast.success("Discount code added.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save this discount code.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{offer ? "Edit Discount Code" : "Add Discount Code"}</SheetTitle>
          <SheetDescription>
            This code is for your own register — members never see it directly. It only appears here and on the
            redemption screen when you look up a member.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-5">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Member discount"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount type *</Label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value as DiscountType)}
                className={selectClassName}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{form.discountType === "percentage" ? "Percent off *" : "Amount off *"}</Label>
              <Input
                type="number"
                min={0}
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 border-t pt-5">
            <Label>Your discount code *</Label>
            <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. MEMBER15" />
          </div>
          <div className="space-y-2">
            <Label>Minimum purchase amount</Label>
            <Input
              type="number"
              min={0}
              value={form.minimumPurchaseAmount}
              onChange={(e) => set("minimumPurchaseAmount", e.target.value)}
              placeholder="No minimum"
            />
          </div>
          <div className="space-y-2 border-t pt-5">
            <Label>Expires on</Label>
            <Input type="date" value={form.validTo} onChange={(e) => set("validTo", e.target.value)} />
            <p className="text-xs text-muted-foreground">Leave blank if this code doesn&apos;t expire.</p>
          </div>
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Saving..." : offer ? "Save changes" : "Add code"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function MerchantDiscountsPage() {
  const { user } = useSession();
  const canAddCodes = user?.merchantStatus === "active";
  const [offers, setOffers] = useState<MerchantOffer[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<MerchantOffer | null>(null);
  const [deletingOffer, setDeletingOffer] = useState<MerchantOffer | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      const data = await apiFetch<{ offers: MerchantOffer[] }>("/merchant/offers");
      setOffers(data.offers);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't load your discount codes.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeOffers = useMemo(() => (offers ?? []).filter((o) => o.isActive), [offers]);

  async function handleDelete() {
    if (!deletingOffer) return;
    setDeleting(true);
    try {
      await apiFetch(`/merchant/offers/${deletingOffer.id}`, { method: "DELETE" });
      toast.success("Discount code removed.");
      setDeletingOffer(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't remove this discount code.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the discount codes you apply at checkout. These are never shown to members directly.
          </p>
        </div>
        <Button className="gap-2" disabled={!canAddCodes} onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add code
        </Button>
      </div>

      {!canAddCodes && (
        <p className="text-sm text-muted-foreground">
          Adding discount codes is disabled until your application is approved.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your discount codes</CardTitle>
          <CardDescription>{activeOffers.length} active</CardDescription>
        </CardHeader>
        <CardContent>
          {!offers ? (
            <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Tag className="h-8 w-8 text-muted-foreground" />
              <p className="text-base text-muted-foreground">No discount codes yet — add one to start redeeming.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Minimum purchase</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => {
                  const status = offerStatus(offer);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell className="font-mono text-sm">{offer.code}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {offer.discountType === "percentage" ? (
                            <Percent className="h-3.5 w-3.5" />
                          ) : (
                            <DollarSign className="h-3.5 w-3.5" />
                          )}
                          {offer.discountValue}
                          {offer.discountType === "percentage" ? "%" : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {offer.minimumPurchaseAmount !== undefined ? offer.minimumPurchaseAmount : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {offer.validTo ? formatDate(offer.validTo) : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("uppercase", status.tone)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingOffer(offer)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          {offer.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeletingOffer(offer)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <OfferFormSheet offer={null} open={formOpen} onOpenChange={setFormOpen} onSaved={load} />
      <OfferFormSheet
        offer={editingOffer}
        open={!!editingOffer}
        onOpenChange={(open) => !open && setEditingOffer(null)}
        onSaved={load}
      />

      <AlertDialog open={!!deletingOffer} onOpenChange={(open) => !open && setDeletingOffer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove &quot;{deletingOffer?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This code will no longer be offered at the redemption screen. Past redemptions using it aren&apos;t affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
