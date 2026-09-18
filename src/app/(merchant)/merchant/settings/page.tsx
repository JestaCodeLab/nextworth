"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Store, Lock, MapPin, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { apiFetch, ApiError } from "@/lib/api";
import type { MerchantAccount, MerchantLocation } from "@/lib/types";

function EditAccountSheet({
  merchant,
  open,
  onOpenChange,
  onSaved,
}: {
  merchant: MerchantAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(merchant.name);
  const [category, setCategory] = useState(merchant.category);
  const [description, setDescription] = useState(merchant.description ?? "");
  const [contactEmail, setContactEmail] = useState(merchant.contactEmail ?? "");
  const [contactPhone, setContactPhone] = useState(merchant.contactPhone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(merchant.name);
      setCategory(merchant.category);
      setDescription(merchant.description ?? "");
      setContactEmail(merchant.contactEmail ?? "");
      setContactPhone(merchant.contactPhone ?? "");
    }
  }

  const canSubmit = name.trim().length >= 2 && category.trim().length >= 2;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await apiFetch("/merchant/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          description: description.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
        }),
      });
      toast.success("Business details updated.");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Business Information</SheetTitle>
          <SheetDescription>Update your business name, category, and contact details.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-1.5">
            <Label htmlFor="merchant-name">Business name</Label>
            <Input id="merchant-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="merchant-category">Category</Label>
            <Input id="merchant-category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="merchant-description">Description</Label>
            <Textarea id="merchant-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="merchant-email">Contact email</Label>
            <Input id="merchant-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="merchant-phone">Contact phone</Label>
            <Input id="merchant-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface LocationDraft {
  label: string;
  address: string;
  city: string;
  mapsUrl: string;
}

function toDraft(location: MerchantLocation): LocationDraft {
  return { label: location.label, address: location.address ?? "", city: location.city ?? "", mapsUrl: location.mapsUrl ?? "" };
}

function ManageLocationsSheet({
  merchant,
  open,
  onOpenChange,
  onSaved,
}: {
  merchant: MerchantAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [drafts, setDrafts] = useState<LocationDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDrafts(merchant.locations.map(toDraft));
  }

  function updateDraft(index: number, patch: Partial<LocationDraft>) {
    setDrafts((current) => current.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addDraft() {
    setDrafts((current) => [...current, { label: "", address: "", city: "", mapsUrl: "" }]);
  }

  function removeDraft(index: number) {
    setDrafts((current) => current.filter((_, i) => i !== index));
  }

  const canSubmit = drafts.every((d) => d.label.trim().length > 0 && d.mapsUrl.trim().length > 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await apiFetch("/merchant/me", {
        method: "PATCH",
        body: JSON.stringify({
          locations: drafts.map((d) => ({
            label: d.label.trim(),
            address: d.address.trim() || undefined,
            city: d.city.trim() || undefined,
            mapsUrl: d.mapsUrl.trim(),
          })),
        }),
      });
      toast.success("Locations updated.");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Locations</SheetTitle>
          <SheetDescription>
            Name each branch clearly — you&apos;ll pick between them when redeeming a discount if you have more than one.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {drafts.map((draft, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label>Location {index + 1}</Label>
                <button
                  type="button"
                  onClick={() => removeDraft(index)}
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                  aria-label="Remove location"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={draft.label} onChange={(e) => updateDraft(index, { label: e.target.value })} placeholder="e.g. Downtown" />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input value={draft.address} onChange={(e) => updateDraft(index, { address: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={draft.city} onChange={(e) => updateDraft(index, { city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Google Maps link *</Label>
                <Input value={draft.mapsUrl} onChange={(e) => updateDraft(index, { mapsUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="gap-2" onClick={addDraft}>
            <Plus className="h-4 w-4" />
            Add location
          </Button>
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ChangePasswordSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await apiFetch("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast.success("Your password has been changed.");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Change Password</SheetTitle>
          <SheetDescription>Choose a new password with at least 8 characters.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords don&apos;t match.</p>
            )}
          </div>
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function MerchantSettingsPage() {
  const [merchant, setMerchant] = useState<MerchantAccount | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  async function load() {
    try {
      const data = await apiFetch<{ merchant: MerchantAccount }>("/merchant/me");
      setMerchant(data.merchant);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't load your account.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (!merchant) return null;

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your business account, locations, and security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <button
              onClick={() => setAccountOpen(true)}
              className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Store className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{merchant.name}</p>
                <p className="text-xs text-muted-foreground">{merchant.category} · Update name, category, and contact details.</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            <button
              onClick={() => setLocationsOpen(true)}
              className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Locations</p>
                <p className="text-xs text-muted-foreground">
                  {merchant.locations.length} location{merchant.locations.length === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <button
              onClick={() => setPasswordOpen(true)}
              className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password.</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>

      <EditAccountSheet merchant={merchant} open={accountOpen} onOpenChange={setAccountOpen} onSaved={load} />
      <ManageLocationsSheet merchant={merchant} open={locationsOpen} onOpenChange={setLocationsOpen} onSaved={load} />
      <ChangePasswordSheet open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  );
}
