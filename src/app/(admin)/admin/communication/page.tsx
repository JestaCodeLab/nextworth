"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Mail, MessageSquare, Users, Store, Search, Wallet, RefreshCw, Hash, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

function notifySendResult(result: { recipientCount: number; sent: number; failed: number }) {
  if (result.sent === 0) {
    toast.error(`Couldn't send to any recipients — all ${result.failed} failed.`);
  } else if (result.failed > 0) {
    toast.warn(`Sent to ${result.sent} of ${result.recipientCount} recipients — ${result.failed} failed.`);
  } else {
    toast.success(`Sent to ${result.sent} of ${result.recipientCount} recipients.`);
  }
}

type RecipientType = "users" | "merchants";

interface RecipientOption {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

function useRecipients(recipientType: RecipientType) {
  const [recipients, setRecipients] = useState<RecipientOption[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRecipients(null);
    const path = recipientType === "users" ? "/admin/users" : "/merchants";
    const key = recipientType === "users" ? "users" : "merchants";
    apiFetch<Record<string, { id: string; name: string; email?: string; phone?: string; contactEmail?: string; contactPhone?: string }[]>>(
      path,
    )
      .then((data) => {
        if (cancelled) return;
        const list = data[key].map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email ?? r.contactEmail,
          phone: r.phone ?? r.contactPhone,
        }));
        setRecipients(list);
      })
      .catch(() => {
        if (!cancelled) setRecipients([]);
      });
    return () => {
      cancelled = true;
    };
  }, [recipientType]);

  return recipients;
}

function RecipientPicker({
  recipientType,
  onRecipientTypeChange,
  selectedIds,
  onSelectedIdsChange,
  requireField,
}: {
  recipientType: RecipientType;
  onRecipientTypeChange: (type: RecipientType) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  requireField: "email" | "phone";
}) {
  const recipients = useRecipients(recipientType);
  const [search, setSearch] = useState("");

  const eligible = useMemo(() => (recipients ?? []).filter((r) => Boolean(r[requireField])), [recipients, requireField]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter((r) => r.name.toLowerCase().includes(q) || r[requireField]?.toLowerCase().includes(q));
  }, [eligible, search, requireField]);

  const allSelected = eligible.length > 0 && eligible.every((r) => selectedIds.includes(r.id));

  function toggleType(type: RecipientType) {
    onRecipientTypeChange(type);
    onSelectedIdsChange([]);
    setSearch("");
  }

  function toggleOne(id: string) {
    onSelectedIdsChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  function toggleAll() {
    onSelectedIdsChange(allSelected ? [] : eligible.map((r) => r.id));
  }

  return (
    <div className="space-y-3">
      <Label>Recipients</Label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toggleType("users")}
          className={cn(
            "flex items-center gap-2.5 rounded-lg border p-4 text-base font-medium transition-colors",
            recipientType === "users" ? "border-primary bg-accent" : "hover:bg-muted/50",
          )}
        >
          <Users className="h-5 w-5" />
          Users
        </button>
        <button
          type="button"
          onClick={() => toggleType("merchants")}
          className={cn(
            "flex items-center gap-2.5 rounded-lg border p-4 text-base font-medium transition-colors",
            recipientType === "merchants" ? "border-primary bg-accent" : "hover:bg-muted/50",
          )}
        >
          <Store className="h-5 w-5" />
          Merchants
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="pl-10" />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border">
        {!recipients ? (
          <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-base text-muted-foreground">
            {eligible.length === 0 ? `No ${recipientType} with a ${requireField} on file.` : "No matches."}
          </p>
        ) : (
          <>
            <label className="flex cursor-pointer items-center gap-2.5 border-b px-4 py-2.5 text-base font-medium hover:bg-muted/50">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 cursor-pointer" />
              Select all ({eligible.length})
            </label>
            {filtered.map((r) => (
              <label
                key={r.id}
                className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-base hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => toggleOne(r.id)}
                  className="h-4 w-4 cursor-pointer"
                />
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r[requireField]}</p>
                </div>
              </label>
            ))}
          </>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{selectedIds.length} selected.</p>
    </div>
  );
}

function ManualNumbersInput({ numbers, onNumbersChange }: { numbers: string[]; onNumbersChange: (numbers: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    // Supports pasting a comma/newline/space-separated batch, not just one at a time.
    const candidates = draft
      .split(/[\s,]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (candidates.length === 0) return;

    const merged = new Set(numbers);
    for (const candidate of candidates) merged.add(candidate);
    onNumbersChange(Array.from(merged));
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft.length === 0 && numbers.length > 0) {
      onNumbersChange(numbers.slice(0, -1));
    }
  }

  function removeNumber(number: string) {
    onNumbersChange(numbers.filter((n) => n !== number));
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="sms-manual-numbers">Phone numbers</Label>
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border p-2">
        {numbers.map((number) => (
          <span
            key={number}
            className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-sm font-medium text-accent-foreground"
          >
            {number}
            <button
              type="button"
              onClick={() => removeNumber(number)}
              aria-label={`Remove ${number}`}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id="sms-manual-numbers"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={numbers.length === 0 ? "e.g. +233241234567 — press Enter to add" : "Add another…"}
          className="min-w-40 flex-1 bg-transparent px-1.5 py-1 text-base outline-none"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Include the country code (e.g. +233…). Press Enter, comma, or paste a list to add multiple at once.{" "}
        {numbers.length} added.
      </p>
    </div>
  );
}

function EmailTab() {
  const [recipientType, setRecipientType] = useState<RecipientType>("users");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const canSubmit = selectedIds.length > 0 && subject.trim().length > 0 && message.trim().length > 0;

  async function handleSend() {
    setSending(true);
    try {
      const result = await apiFetch<{ recipientCount: number; sent: number; failed: number }>("/admin/communication/email", {
        method: "POST",
        body: JSON.stringify({ recipientType, recipientIds: selectedIds, subject: subject.trim(), message: message.trim() }),
      });
      notifySendResult(result);
      setConfirmOpen(false);
      setSelectedIds([]);
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Email</CardTitle>
        <CardDescription>Choose one or more recipients and compose an email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RecipientPicker
          recipientType={recipientType}
          onRecipientTypeChange={setRecipientType}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          requireField="email"
        />
        <div className="space-y-2">
          <Label htmlFor="email-subject">Subject</Label>
          <Input id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-message">Message</Label>
          <Textarea id="email-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
        </div>
        <Button disabled={!canSubmit} onClick={() => setConfirmOpen(true)}>
          <Mail className="h-4 w-4" />
          Send email
        </Button>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to {selectedIds.length} recipient{selectedIds.length === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>This sends immediately — there&apos;s no undo once it&apos;s out.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={sending} onClick={handleSend}>
              {sending ? "Sending..." : "Send now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function SmsTab() {
  const [smsSource, setSmsSource] = useState<"existing" | "manual">("existing");
  const [recipientType, setRecipientType] = useState<RecipientType>("users");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [manualNumbers, setManualNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    senderId: string | null;
    wallet: { balance: number | null; currency?: string; error?: string };
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function loadStatus() {
    return apiFetch<typeof status>("/admin/sms/status")
      .then(setStatus)
      .catch(() => setStatus(null));
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleRefreshBalance() {
    setRefreshing(true);
    try {
      await loadStatus();
    } finally {
      setRefreshing(false);
    }
  }

  const recipientCount = smsSource === "manual" ? manualNumbers.length : selectedIds.length;
  const canSubmit = Boolean(status?.configured) && recipientCount > 0 && message.trim().length > 0;
  const segments = message.length === 0 ? 0 : message.length <= 160 ? 1 : Math.ceil(message.length / 153);
  const creditsNeeded = recipientCount * segments;
  const insufficientCredits =
    status?.wallet.balance !== null && status?.wallet.balance !== undefined && creditsNeeded > status.wallet.balance;

  async function handleSend() {
    setSending(true);
    try {
      const body =
        smsSource === "manual"
          ? { recipientType: "manual", phoneNumbers: manualNumbers, message: message.trim() }
          : { recipientType, recipientIds: selectedIds, message: message.trim() };
      const result = await apiFetch<{ recipientCount: number; sent: number; failed: number }>("/admin/communication/sms", {
        method: "POST",
        body: JSON.stringify(body),
      });
      notifySendResult(result);
      setConfirmOpen(false);
      setSelectedIds([]);
      setManualNumbers([]);
      setMessage("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't send SMS.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-card to-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-muted-foreground">SMS balance</p>
                <button
                  type="button"
                  onClick={handleRefreshBalance}
                  disabled={refreshing}
                  aria-label="Refresh SMS balance"
                  className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                </button>
              </div>
              {!status ? (
                <p className="text-3xl font-bold">—</p>
              ) : status.wallet.balance !== null ? (
                <p className="text-3xl font-bold">
                  {status.wallet.balance} <span className="text-lg font-medium text-muted-foreground">credits</span>
                </p>
              ) : (
                <p className="text-base text-muted-foreground">{status.wallet.error ?? "Unavailable"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
            <div>
              <p className="text-sm text-muted-foreground">Sender ID</p>
              <p className="text-base font-medium">{status?.senderId ?? "—"}</p>
            </div>
            <Badge
              variant="outline"
              className={cn("gap-1.5 uppercase", status?.configured ? "text-success" : "text-amber-500")}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status?.configured ? "bg-success" : "bg-amber-500")} />
              {status?.configured ? "Connected" : "Not configured"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send SMS</CardTitle>
          <CardDescription>Choose one or more recipients and compose a text message.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status && !status.configured && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-base text-amber-600">
              FlockText isn&apos;t configured yet — add <code>FLOCKTEXT_API_KEY</code> and{" "}
              <code>FLOCKTEXT_SENDER_ID</code> to the API&apos;s environment to enable SMS.
            </div>
          )}

          <div className="space-y-3">
            <Label>Send to</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSmsSource("existing")}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border p-4 text-base font-medium transition-colors",
                  smsSource === "existing" ? "border-primary bg-accent" : "hover:bg-muted/50",
                )}
              >
                <Users className="h-5 w-5" />
                Existing users or merchants
              </button>
              <button
                type="button"
                onClick={() => setSmsSource("manual")}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border p-4 text-base font-medium transition-colors",
                  smsSource === "manual" ? "border-primary bg-accent" : "hover:bg-muted/50",
                )}
              >
                <Hash className="h-5 w-5" />
                Enter numbers manually
              </button>
            </div>
          </div>

          {smsSource === "existing" ? (
            <RecipientPicker
              recipientType={recipientType}
              onRecipientTypeChange={setRecipientType}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              requireField="phone"
            />
          ) : (
            <ManualNumbersInput numbers={manualNumbers} onNumbersChange={setManualNumbers} />
          )}

          <div className="space-y-2">
            <Label htmlFor="sms-message">Message</Label>
            <Textarea id="sms-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
            <p className="text-sm text-muted-foreground">{message.length} characters (SMS may split into multiple segments over 160).</p>
          </div>

          <Button disabled={!canSubmit} onClick={() => setConfirmOpen(true)}>
            <MessageSquare className="h-4 w-4" />
            Send SMS
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>This sends immediately — there&apos;s no undo once it&apos;s out.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Estimated credits</span>
            <span className={cn("font-semibold", insufficientCredits && "text-destructive")}>
              {creditsNeeded} {creditsNeeded === 1 ? "credit" : "credits"}
              {segments > 1 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({segments} segments × {recipientCount})
                </span>
              )}
            </span>
          </div>
          {insufficientCredits && (
            <p className="text-sm text-destructive">
              Only {status?.wallet.balance} {status?.wallet.balance === 1 ? "credit" : "credits"} available — this send may fail or go out partially.
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={sending} onClick={handleSend}>
              {sending ? "Sending..." : "Send now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminCommunicationPage() {
  const [tab, setTab] = useState<"email" | "sms">("email");

  return (
    <div className="mx-auto max-w-8xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
        <p className="mt-1.5 text-base text-muted-foreground">Send an email or SMS to one or more users or merchants.</p>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as "email" | "sms")}>
        <TabsList>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <EmailTab />
        </TabsContent>
        <TabsContent value="sms">
          <SmsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
