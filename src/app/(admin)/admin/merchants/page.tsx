"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Store,
  Pencil,
  Plus,
  MapPin,
  ShieldCheck,
  ShieldOff,
  Clock,
  Percent,
  MoreHorizontal,
  Check,
  X,
  RotateCcw,
  Search,
  Send,
  Eye,
  Trash2,
  Tag,
  Receipt,
  KeyRound,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PhoneInput, MARKET_CALLING_CODES } from "@/components/phone-input";
import { DiscountPicker } from "@/components/discount-picker";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MERCHANT_CATEGORIES } from "@/lib/merchant-categories";

const selectClassName =
  "border-input flex h-10 cursor-pointer rounded-lg border bg-transparent px-3.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface MerchantLocation {
  label: string;
  address?: string;
  city?: string;
  country: string;
  mapsUrl?: string;
}

type MerchantStatus = "pending" | "active" | "inactive" | "rejected";

interface MerchantRow {
  id: string;
  name: string;
  category: string;
  description?: string;
  logoUrl?: string;
  country: "GH" | "UK";
  contactEmail?: string;
  contactPhone?: string;
  discountPercent?: number;
  locations: MerchantLocation[];
  status: MerchantStatus;
  rejectionReason?: string;
}

interface MerchantOfferRow {
  id: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  code?: string;
  isActive: boolean;
  validTo?: string;
}

interface MerchantDetails {
  merchant: MerchantRow;
  offers: MerchantOfferRow[];
  portalLogin: { id: string; email: string; contactVerified: boolean } | null;
  redemptionCount: number;
}

const statusTone: Record<MerchantStatus, string> = {
  pending: "text-amber-500",
  active: "text-success",
  inactive: "text-muted-foreground",
  rejected: "text-destructive",
};

const statusLabel: Record<MerchantStatus, string> = {
  pending: "Pending review",
  active: "Active",
  inactive: "Suspended",
  rejected: "Rejected",
};

interface MerchantFormState {
  name: string;
  category: string;
  description: string;
  logoUrl: string;
  country: "GH" | "UK";
  contactEmail: string;
  contactPhone: string;
  discountPercent: string;
  address: string;
  city: string;
  mapsUrl: string;
}

const emptyForm: MerchantFormState = {
  name: "",
  category: "",
  description: "",
  logoUrl: "",
  country: "GH",
  contactEmail: "",
  contactPhone: "",
  discountPercent: "",
  address: "",
  city: "",
  mapsUrl: "",
};

function buildPayload(form: MerchantFormState) {
  const hasLocation = form.mapsUrl.trim().length > 0;
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim() || undefined,
    logoUrl: form.logoUrl.trim() || undefined,
    country: form.country,
    contactEmail: form.contactEmail.trim() || undefined,
    contactPhone: form.contactPhone.trim() ? `${MARKET_CALLING_CODES[form.country]}${form.contactPhone.trim()}` : undefined,
    discountPercent: form.discountPercent.trim() ? Number(form.discountPercent) : undefined,
    location: hasLocation
      ? {
          address: form.address.trim() || undefined,
          city: form.city.trim() || undefined,
          mapsUrl: form.mapsUrl.trim(),
        }
      : undefined,
  };
}

function MerchantFormFields({ form, onChange }: { form: MerchantFormState; onChange: (next: MerchantFormState) => void }) {
  function set<K extends keyof MerchantFormState>(key: K, value: MerchantFormState[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Category *</Label>
        <select value={form.category} onChange={(e) => set("category", e.target.value)} className={cn(selectClassName, "w-full")}>
          <option value="" disabled>
            Select a category
          </option>
          {MERCHANT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Logo URL</Label>
        <Input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
      </div>
      <div className="space-y-2 border-t pt-5">
        <Label>Market *</Label>
        <select
          value={form.country}
          onChange={(e) => set("country", e.target.value as "GH" | "UK")}
          className="border-input flex h-10 w-full cursor-pointer rounded-lg border bg-transparent px-3.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="GH">Ghana</option>
          <option value="UK">United Kingdom</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Percent className="h-3.5 w-3.5" />
          Discount for members *
        </Label>
        <DiscountPicker value={form.discountPercent} onChange={(v) => set("discountPercent", v)} />
      </div>
      <div className="grid grid-cols-2 gap-4 border-t pt-5">
        <div className="space-y-2">
          <Label>Contact email</Label>
          <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Contact phone</Label>
          <PhoneInput market={form.country} value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
        </div>
      </div>
      <div className="space-y-2 border-t pt-5">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>City</Label>
        <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Google Maps link *</Label>
        <Input
          value={form.mapsUrl}
          onChange={(e) => set("mapsUrl", e.target.value)}
          placeholder="https://maps.app.goo.gl/…"
        />
      </div>
    </div>
  );
}

function MerchantFormSheet({
  title,
  description,
  merchant,
  open,
  onOpenChange,
  onSaved,
}: {
  title: string;
  description: string;
  merchant: MerchantRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<MerchantFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (merchant) {
      const location = merchant.locations[0];
      const callingCode = MARKET_CALLING_CODES[merchant.country];
      setForm({
        name: merchant.name,
        category: merchant.category,
        description: merchant.description ?? "",
        logoUrl: merchant.logoUrl ?? "",
        country: merchant.country,
        contactEmail: merchant.contactEmail ?? "",
        contactPhone: merchant.contactPhone?.startsWith(callingCode)
          ? merchant.contactPhone.slice(callingCode.length)
          : (merchant.contactPhone ?? ""),
        discountPercent: merchant.discountPercent !== undefined ? String(merchant.discountPercent) : "",
        address: location?.address ?? "",
        city: location?.city ?? "",
        mapsUrl: location?.mapsUrl ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, merchant]);

  const canSubmit =
    form.name.trim().length >= 2 &&
    form.category.trim().length >= 2 &&
    form.discountPercent.trim().length > 0 &&
    form.mapsUrl.trim().length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      if (merchant) {
        await apiFetch(`/merchants/${merchant.id}`, { method: "PATCH", body: JSON.stringify(buildPayload(form)) });
        toast.success("Merchant updated.");
      } else {
        await apiFetch("/merchants", { method: "POST", body: JSON.stringify(buildPayload(form)) });
        toast.success("Merchant onboarded.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save merchant.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-5">
          <MerchantFormFields form={form} onChange={setForm} />
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Saving..." : merchant ? "Save changes" : "Add merchant"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function RejectMerchantDialog({
  merchant,
  onOpenChange,
  submitting,
  onConfirm,
}: {
  merchant: MerchantRow | null;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [merchant?.id]);

  return (
    <AlertDialog open={!!merchant} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject {merchant?.name}&apos;s application?</AlertDialogTitle>
          <AlertDialogDescription>
            Optionally let them know why, in case they reapply. This is for your records only — merchants don&apos;t have a
            portal to see it yet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Discount too low, missing contact details…"
          rows={3}
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting}
            onClick={() => {
              if (merchant) onConfirm(merchant.id, reason);
              setReason("");
            }}
          >
            {submitting ? "Rejecting..." : "Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ApproveMerchantDialog({
  merchant,
  onOpenChange,
  submitting,
  onConfirm,
}: {
  merchant: MerchantRow | null;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onConfirm: (merchant: MerchantRow) => void;
}) {
  return (
    <AlertDialog open={!!merchant} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve {merchant?.name}&apos;s application?</AlertDialogTitle>
          <AlertDialogDescription>
            They&apos;ll go live on Find Merchants and be notified by email and in their portal. They can start
            adding discount codes right away.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={submitting} onClick={() => merchant && onConfirm(merchant)}>
            {submitting ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MerchantDetailsSheet({
  merchantId,
  onOpenChange,
  onEdit,
}: {
  merchantId: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (merchant: MerchantRow) => void;
}) {
  const [details, setDetails] = useState<MerchantDetails | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setDetails(null);
      return;
    }
    apiFetch<MerchantDetails>(`/merchants/${merchantId}/admin`)
      .then(setDetails)
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Couldn't load merchant details.");
        onOpenChange(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const merchant = details?.merchant;

  return (
    <Sheet open={!!merchantId} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{merchant?.name ?? "Merchant details"}</SheetTitle>
          <SheetDescription>{merchant?.category}</SheetDescription>
        </SheetHeader>

        {!details ? (
          <p className="px-4 py-8 text-center text-base text-muted-foreground">Loading…</p>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto px-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("uppercase", statusTone[merchant!.status])}>
                {statusLabel[merchant!.status]}
              </Badge>
              {merchant!.discountPercent !== undefined && (
                <Badge variant="outline" className="gap-1">
                  <Percent className="h-3 w-3" />
                  {merchant!.discountPercent}% listed
                </Badge>
              )}
            </div>

            {merchant!.description && <p className="text-sm text-muted-foreground">{merchant!.description}</p>}

            <div className="space-y-2 text-sm">
              {merchant!.contactEmail && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" /> {merchant!.contactEmail}
                </p>
              )}
              {merchant!.contactPhone && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" /> {merchant!.contactPhone}
                </p>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Locations</p>
              {merchant!.locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No locations on file.</p>
              ) : (
                <ul className="space-y-1.5">
                  {merchant!.locations.map((location, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {location.label}
                        {location.city ? ` · ${location.city}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <KeyRound className="h-3.5 w-3.5" /> Portal login
              </p>
              {details.portalLogin ? (
                <p className="text-sm text-muted-foreground">
                  {details.portalLogin.email} —{" "}
                  {details.portalLogin.contactVerified ? "verified" : "not yet verified"}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No portal login yet.</p>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Tag className="h-3.5 w-3.5" /> Discount codes ({details.offers.length})
              </p>
              {details.offers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No discount codes added yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {details.offers.map((offer) => (
                    <li key={offer.id} className="flex items-center justify-between text-sm">
                      <span>{offer.title}</span>
                      <span className="text-muted-foreground">
                        {offer.discountValue}
                        {offer.discountType === "percentage" ? "%" : ""} {!offer.isActive && "· retired"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Receipt className="h-3.5 w-3.5" /> Redemptions
              </p>
              <p className="text-sm text-muted-foreground">{details.redemptionCount} total</p>
            </div>
          </div>
        )}

        <SheetFooter className="mt-auto flex-row px-0">
          <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Close</SheetClose>
          <Button className="flex-1" disabled={!merchant} onClick={() => merchant && onEdit(merchant)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DeleteMerchantDialog({
  merchant,
  onOpenChange,
  submitting,
  onConfirm,
}: {
  merchant: MerchantRow | null;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onConfirm: (id: string) => void;
}) {
  return (
    <AlertDialog open={!!merchant} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently delete {merchant?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes the merchant along with every discount code, portal login, and redemption record tied to
            it — including from members&apos; own transaction history. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting}
            onClick={() => merchant && onConfirm(merchant.id)}
          >
            {submitting ? "Deleting..." : "Delete permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<MerchantRow[] | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<MerchantRow | null>(null);
  const [rejectingMerchant, setRejectingMerchant] = useState<MerchantRow | null>(null);
  const [approvingMerchant, setApprovingMerchant] = useState<MerchantRow | null>(null);
  const [viewingMerchantId, setViewingMerchantId] = useState<string | null>(null);
  const [deletingMerchant, setDeletingMerchant] = useState<MerchantRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MerchantStatus>("all");

  async function load() {
    try {
      const data = await apiFetch<{ merchants: MerchantRow[] }>("/merchants/admin");
      setMerchants(data.merchants);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't load merchants.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredMerchants = useMemo(() => {
    if (!merchants) return null;
    const query = search.trim().toLowerCase();
    return merchants.filter((merchant) => {
      if (statusFilter !== "all" && merchant.status !== statusFilter) return false;
      if (query && !merchant.name.toLowerCase().includes(query) && !merchant.category.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [merchants, search, statusFilter]);

  const stats = useMemo(() => {
    const list = merchants ?? [];
    return {
      total: list.length,
      pending: list.filter((m) => m.status === "pending").length,
      active: list.filter((m) => m.status === "active").length,
      suspended: list.filter((m) => m.status === "inactive").length,
    };
  }, [merchants]);

  const statCards = [
    { label: "Total merchants", icon: Store, value: stats.total, tint: "bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" },
    { label: "Pending review", icon: Clock, value: stats.pending, tint: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" },
    { label: "Active", icon: ShieldCheck, value: stats.active, tint: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" },
    { label: "Suspended", icon: ShieldOff, value: stats.suspended, tint: "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" },
  ];

  async function setMerchantStatus(id: string, status: MerchantStatus, rejectionReason?: string) {
    setActingOn(id);
    try {
      await apiFetch(`/merchants/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectionReason }),
      });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update merchant.");
    } finally {
      setActingOn(null);
    }
  }

  async function handleApprove(merchant: MerchantRow) {
    await setMerchantStatus(merchant.id, "active");
    setApprovingMerchant(null);
    toast.success(`${merchant.name} approved — now visible on Find Merchants.`);
  }

  async function handleReject(id: string, reason: string) {
    await setMerchantStatus(id, "rejected", reason.trim() || undefined);
    setRejectingMerchant(null);
    toast.success("Merchant rejected.");
  }

  async function handleToggleActive(merchant: MerchantRow) {
    await setMerchantStatus(merchant.id, merchant.status === "active" ? "inactive" : "active");
  }

  async function handleReconsider(merchant: MerchantRow) {
    await setMerchantStatus(merchant.id, "pending");
  }

  async function handleInviteUser(merchant: MerchantRow) {
    setActingOn(merchant.id);
    try {
      await apiFetch(`/merchants/${merchant.id}/invite-user`, { method: "POST" });
      toast.success(`Invite sent to ${merchant.contactEmail}.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send the invite.");
    } finally {
      setActingOn(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await apiFetch(`/merchants/${id}`, { method: "DELETE" });
      toast.success("Merchant deleted.");
      setDeletingMerchant(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete this merchant.");
    } finally {
      setDeleting(false);
    }
  }

  function openEditFromDetails(merchant: MerchantRow) {
    setViewingMerchantId(null);
    setEditingMerchant(merchant);
  }

  return (
    <div className="mx-auto max-w-8xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
          <p className="mt-1.5 text-base text-muted-foreground">Review applications, onboard, edit, and suspend participating merchants.</p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add merchant
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, icon: Icon, value, tint }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", tint)}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{merchants ? value : "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All merchants</CardTitle>
          <CardDescription>Every participating merchant, including pending self-registrations awaiting review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category"
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className={selectClassName}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending review</option>
              <option value="active">Active</option>
              <option value="inactive">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {!filteredMerchants ? (
            <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
          ) : filteredMerchants.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Store className="h-8 w-8 text-muted-foreground" />
              <p className="text-base text-muted-foreground">
                {merchants?.length ? "No merchants match these filters." : "No merchants yet — add one to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMerchants.map((merchant) => {
                  const location = merchant.locations[0];
                  return (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          onClick={() => setViewingMerchantId(merchant.id)}
                          className="cursor-pointer text-left hover:underline"
                        >
                          {merchant.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{merchant.category}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {merchant.discountPercent !== undefined ? `${merchant.discountPercent}%` : "—"}
                      </TableCell>
                      <TableCell>
                        {location ? (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            {location.mapsUrl ? (
                              <a
                                href={location.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-primary hover:underline"
                              >
                                <MapPin className="h-4 w-4 shrink-0" />
                                {location.city ?? location.country}
                              </a>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 shrink-0" />
                                {location.city ?? location.country}
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("uppercase", statusTone[merchant.status])}>
                          {statusLabel[merchant.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {merchant.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              disabled={actingOn === merchant.id}
                              onClick={() => setRejectingMerchant(merchant)}
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                            <Button size="sm" disabled={actingOn === merchant.id} onClick={() => setApprovingMerchant(merchant)}>
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
                                aria-label="More actions"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewingMerchantId(merchant.id)}>
                                  <Eye className="h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" onClick={() => setDeletingMerchant(merchant)}>
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
                              aria-label="Actions"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingMerchantId(merchant.id)}>
                                <Eye className="h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingMerchant(merchant)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {merchant.status === "active" && (
                                <DropdownMenuItem
                                  disabled={actingOn === merchant.id || !merchant.contactEmail}
                                  onClick={() => handleInviteUser(merchant)}
                                >
                                  <Send className="h-4 w-4" />
                                  Invite portal login
                                </DropdownMenuItem>
                              )}
                              {merchant.status === "active" && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  disabled={actingOn === merchant.id}
                                  onClick={() => handleToggleActive(merchant)}
                                >
                                  <ShieldOff className="h-4 w-4" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {merchant.status === "inactive" && (
                                <DropdownMenuItem disabled={actingOn === merchant.id} onClick={() => handleToggleActive(merchant)}>
                                  <ShieldCheck className="h-4 w-4" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}
                              {merchant.status === "rejected" && (
                                <DropdownMenuItem disabled={actingOn === merchant.id} onClick={() => handleReconsider(merchant)}>
                                  <RotateCcw className="h-4 w-4" />
                                  Reconsider
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem variant="destructive" onClick={() => setDeletingMerchant(merchant)}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MerchantFormSheet
        title="Onboard Merchant"
        description="Add a new participating merchant and its primary location."
        merchant={null}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={load}
      />

      <MerchantFormSheet
        title="Edit Merchant"
        description="Update this merchant's details and primary location."
        merchant={editingMerchant}
        open={!!editingMerchant}
        onOpenChange={(open) => !open && setEditingMerchant(null)}
        onSaved={load}
      />

      <RejectMerchantDialog
        merchant={rejectingMerchant}
        onOpenChange={(open) => !open && setRejectingMerchant(null)}
        submitting={actingOn === rejectingMerchant?.id}
        onConfirm={handleReject}
      />

      <ApproveMerchantDialog
        merchant={approvingMerchant}
        onOpenChange={(open) => !open && setApprovingMerchant(null)}
        submitting={actingOn === approvingMerchant?.id}
        onConfirm={handleApprove}
      />

      <MerchantDetailsSheet
        merchantId={viewingMerchantId}
        onOpenChange={(open) => !open && setViewingMerchantId(null)}
        onEdit={openEditFromDetails}
      />

      <DeleteMerchantDialog
        merchant={deletingMerchant}
        onOpenChange={(open) => !open && setDeletingMerchant(null)}
        submitting={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
