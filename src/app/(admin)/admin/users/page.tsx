"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Users, Pencil, Eye, FileText, User as UserIcon, MoreHorizontal, Search, Plus, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiError, API_URL } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const selectClassName =
  "border-input flex h-10 cursor-pointer rounded-lg border bg-transparent px-3.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  status: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  country?: "GH" | "UK";
  role: "user" | "admin";
  photoUrl?: string;
  hasDocument: boolean;
  hasPendingInvite: boolean;
  createdAt: string;
  credentialStatus: "none" | "pending" | "active" | "suspended" | "expired";
}

const statusTone: Record<AdminUserRow["status"], string> = {
  pending: "text-muted-foreground",
  verified: "text-success",
  rejected: "text-destructive",
};

const credentialTone: Record<AdminUserRow["credentialStatus"], string> = {
  none: "text-muted-foreground",
  pending: "text-amber-500",
  active: "text-success",
  suspended: "text-destructive",
  expired: "text-muted-foreground",
};

function RejectDialog({
  user,
  onOpenChange,
  submitting,
  onConfirm,
}: {
  user: AdminUserRow | null;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [user?.id]);

  return (
    <AlertDialog open={!!user} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject {user?.name}&apos;s application?</AlertDialogTitle>
          <AlertDialogDescription>
            Let them know why, so they can fix it when they resubmit. This is shown to the user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Photo is blurry, ID document doesn't match name on file…"
          rows={3}
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting}
            onClick={() => {
              if (user) onConfirm(user.id, reason);
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

function ApproveDialog({
  user,
  onOpenChange,
  submitting,
  onConfirm,
}: {
  user: AdminUserRow | null;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onConfirm: (id: string) => void;
}) {
  return (
    <AlertDialog open={!!user} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve {user?.name}&apos;s application?</AlertDialogTitle>
          <AlertDialogDescription>
            Their credential moves to pending-payment, and they&apos;ll be notified by email (and SMS, for Ghana
            numbers).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={submitting} onClick={() => user && onConfirm(user.id)}>
            {submitting ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UserDetailSheet({
  user,
  onOpenChange,
  actingOn,
  onApprove,
  onRejectClick,
  onSuspendCredential,
  onReactivateCredential,
  onResendInvite,
}: {
  user: AdminUserRow | null;
  onOpenChange: (open: boolean) => void;
  actingOn: string | null;
  onApprove: (id: string) => void;
  onRejectClick: (user: AdminUserRow) => void;
  onSuspendCredential: (id: string) => void;
  onReactivateCredential: (id: string) => void;
  onResendInvite: (id: string) => void;
}) {
  return (
    <Sheet open={!!user} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Applicant Details</SheetTitle>
          <SheetDescription>Review submitted KYC details before approving or rejecting.</SheetDescription>
        </SheetHeader>
        {user && (
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5">
            <div className="flex items-center gap-4">
              {user.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URL, not worth next/image config here
                <img src={user.photoUrl} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <UserIcon className="h-8 w-8" />
                </div>
              )}
              <div>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-base text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 rounded-lg border p-5 text-base">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of birth</p>
                <p className="font-medium">{user.dob ? formatDate(user.dob) : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market</p>
                <p className="font-medium">{user.country ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">KYC status</p>
                <Badge variant="outline" className={cn("mt-1 uppercase", statusTone[user.status])}>
                  {user.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credential</p>
                <Badge variant="outline" className={cn("mt-1 uppercase", credentialTone[user.credentialStatus])}>
                  {user.credentialStatus}
                </Badge>
              </div>
            </div>

            {user.hasDocument ? (
              <Button variant="outline" className="gap-2" render={<a href={`${API_URL}/admin/users/${user.id}/document`} target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
                <FileText className="h-4 w-4" />
                View ID document
              </Button>
            ) : (
              <p className="text-base text-muted-foreground">No ID document on file.</p>
            )}

            {user.status === "rejected" && user.rejectionReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-base">
                <p className="text-sm font-medium text-destructive">Reason given to user</p>
                <p className="mt-1 text-muted-foreground">{user.rejectionReason}</p>
              </div>
            )}

            {user.hasPendingInvite && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-base">
                <div>
                  <p className="text-sm font-medium text-amber-600">Invite pending</p>
                  <p className="mt-1 text-muted-foreground">They haven&apos;t set a password yet.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actingOn === user.id}
                  onClick={() => onResendInvite(user.id)}
                >
                  Resend
                </Button>
              </div>
            )}

            {user.status === "pending" && user.country && (
              <SheetFooter className="mt-auto flex-row px-0">
                <Button
                  variant="ghost"
                  className="flex-1 text-destructive hover:text-destructive"
                  disabled={actingOn === user.id}
                  onClick={() => onRejectClick(user)}
                >
                  Reject
                </Button>
                <Button className="flex-1" disabled={actingOn === user.id} onClick={() => onApprove(user.id)}>
                  Approve
                </Button>
              </SheetFooter>
            )}

            {user.credentialStatus === "active" && (
              <SheetFooter className="mt-auto px-0">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  disabled={actingOn === user.id}
                  onClick={() => onSuspendCredential(user.id)}
                >
                  Suspend credential
                </Button>
              </SheetFooter>
            )}

            {user.credentialStatus === "suspended" && (
              <SheetFooter className="mt-auto px-0">
                <Button disabled={actingOn === user.id} onClick={() => onReactivateCredential(user.id)}>
                  Reactivate credential
                </Button>
              </SheetFooter>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddUserSheet({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [open]);

  const canSubmit = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 6;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      toast.success(`Invite sent to ${email.trim()}.`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't add user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add User</SheetTitle>
          <SheetDescription>
            They&apos;ll get an email to set their password before they can sign in.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-5">
          <div className="space-y-2">
            <Label htmlFor="new-user-name">Full name</Label>
            <Input id="new-user-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-user-email">Email</Label>
            <Input id="new-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-user-phone">Phone number</Label>
            <Input id="new-user-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <SheetFooter className="mt-auto flex-row px-0">
            <SheetClose render={<Button type="button" variant="outline" className="flex-1" />}>Cancel</SheetClose>
            <Button type="submit" className="flex-1" disabled={submitting || !canSubmit}>
              {submitting ? "Sending invite..." : "Send invite"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function EditUserSheet({
  user,
  onOpenChange,
  onSaved,
}: {
  user: AdminUserRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [country, setCountry] = useState<"GH" | "UK" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (user && user.id !== editingId) {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    setDob(user.dob ? new Date(user.dob) : undefined);
    setCountry(user.country ?? "");
  }

  const canSubmit = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !canSubmit) return;

    setSubmitting(true);
    try {
      await apiFetch(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          dob: dob ? dob.toISOString() : undefined,
          country: country || undefined,
        }),
      });
      toast.success("User details updated.");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={!!user} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>Update this user&apos;s personal and KYC details.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-5">
          <div className="space-y-2">
            <Label htmlFor="admin-user-name">Full name</Label>
            <Input id="admin-user-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-user-email">Email</Label>
            <Input id="admin-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-user-phone">Phone number</Label>
            <Input id="admin-user-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date of birth</Label>
            <DatePicker value={dob} onChange={setDob} placeholder="Select a date" disabled={{ after: new Date() }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-user-country">Market</Label>
            <select
              id="admin-user-country"
              value={country}
              onChange={(e) => setCountry(e.target.value as "GH" | "UK" | "")}
              className="border-input flex h-10 w-full cursor-pointer rounded-lg border bg-transparent px-3.5 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Not set</option>
              <option value="GH">Ghana</option>
              <option value="UK">United Kingdom</option>
            </select>
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUserRow | null>(null);
  const [rejectingUser, setRejectingUser] = useState<AdminUserRow | null>(null);
  const [approvingUser, setApprovingUser] = useState<AdminUserRow | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserRow["status"]>("all");
  const [marketFilter, setMarketFilter] = useState<"all" | "GH" | "UK">("all");

  const filteredUsers = useMemo(() => {
    if (!users) return null;
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (marketFilter !== "all" && user.country !== marketFilter) return false;
      if (query && !user.name.toLowerCase().includes(query) && !user.email.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [users, search, statusFilter, marketFilter]);

  async function load() {
    try {
      const data = await apiFetch<{ users: AdminUserRow[] }>("/admin/users");
      setUsers(data.users);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't load users.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: string) {
    setActingOn(id);
    try {
      await apiFetch(`/admin/users/${id}/approve`, { method: "POST" });
      toast.success("User approved — credential is pending payment.");
      setViewingUser(null);
      setApprovingUser(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't approve user.");
    } finally {
      setActingOn(null);
    }
  }

  async function handleReject(id: string, reason: string) {
    setActingOn(id);
    try {
      await apiFetch(`/admin/users/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
      toast.success("User rejected.");
      setViewingUser(null);
      setRejectingUser(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't reject user.");
    } finally {
      setActingOn(null);
    }
  }

  async function handleSuspendCredential(id: string) {
    setActingOn(id);
    try {
      await apiFetch(`/admin/users/${id}/credential/suspend`, { method: "POST" });
      toast.success("Credential suspended.");
      setViewingUser(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't suspend credential.");
    } finally {
      setActingOn(null);
    }
  }

  async function handleReactivateCredential(id: string) {
    setActingOn(id);
    try {
      await apiFetch(`/admin/users/${id}/credential/reactivate`, { method: "POST" });
      toast.success("Credential reactivated.");
      setViewingUser(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't reactivate credential.");
    } finally {
      setActingOn(null);
    }
  }

  async function handleResendInvite(id: string) {
    setActingOn(id);
    try {
      await apiFetch(`/admin/users/${id}/resend-invite`, { method: "POST" });
      toast.success("Invite resent.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't resend invite.");
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users & Credentials</h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Review applications, approve or reject documents, and see credential/payment status.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddUserOpen(true)}>
          <Plus className="h-4 w-4" />
          Add user
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>Approving a user unlocks payment for them — the credential activates once Paystack confirms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className={selectClassName}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value as typeof marketFilter)}
              className={selectClassName}
            >
              <option value="all">All markets</option>
              <option value="GH">Ghana</option>
              <option value="UK">United Kingdom</option>
            </select>
          </div>

          {!filteredUsers ? (
            <p className="py-8 text-center text-base text-muted-foreground">Loading…</p>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-base text-muted-foreground">{users?.length ? "No users match these filters." : "No users yet."}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>KYC status</TableHead>
                  <TableHead>Credential</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.country ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("uppercase", statusTone[user.status])}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("uppercase", credentialTone[user.credentialStatus])}>
                        {user.credentialStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingUser(user)}>
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {user.hasPendingInvite && (
                            <DropdownMenuItem disabled={actingOn === user.id} onClick={() => handleResendInvite(user.id)}>
                              <Mail className="h-4 w-4" />
                              Resend invite
                            </DropdownMenuItem>
                          )}
                          {user.status === "pending" && user.country && (
                            <>
                              <DropdownMenuItem disabled={actingOn === user.id} onClick={() => setApprovingUser(user)}>
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={actingOn === user.id}
                                onClick={() => setRejectingUser(user)}
                              >
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {user.credentialStatus === "active" && (
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={actingOn === user.id}
                              onClick={() => handleSuspendCredential(user.id)}
                            >
                              Suspend credential
                            </DropdownMenuItem>
                          )}
                          {user.credentialStatus === "suspended" && (
                            <DropdownMenuItem disabled={actingOn === user.id} onClick={() => handleReactivateCredential(user.id)}>
                              Reactivate credential
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserDetailSheet
        user={viewingUser}
        onOpenChange={(open) => !open && setViewingUser(null)}
        actingOn={actingOn}
        onApprove={() => viewingUser && setApprovingUser(viewingUser)}
        onRejectClick={setRejectingUser}
        onSuspendCredential={handleSuspendCredential}
        onReactivateCredential={handleReactivateCredential}
        onResendInvite={handleResendInvite}
      />

      <EditUserSheet
        user={editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSaved={load}
      />

      <RejectDialog
        user={rejectingUser}
        onOpenChange={(open) => !open && setRejectingUser(null)}
        submitting={actingOn === rejectingUser?.id}
        onConfirm={handleReject}
      />

      <ApproveDialog
        user={approvingUser}
        onOpenChange={(open) => !open && setApprovingUser(null)}
        submitting={actingOn === approvingUser?.id}
        onConfirm={handleApprove}
      />

      <AddUserSheet open={addUserOpen} onOpenChange={setAddUserOpen} onSaved={load} />
    </div>
  );
}
