"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  User as UserIcon,
  Lock,
  ShieldCheck,
  Laptop,
  ChevronRight,
  Camera,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { AccessStatusCard } from "@/components/dashboard/access-status-card";
import { useSession } from "@/hooks/use-session";
import { useCredential } from "@/hooks/use-credential";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";

function notAvailable() {
  toast.info("This isn't available yet in this build.");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProfilePhotoUploader({ user }: { user: SessionUser }) {
  const { refresh } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });

    const formData = new FormData();
    formData.append("photo", file);

    setUploading(true);
    try {
      await apiFetch("/users/me/photo", { method: "PATCH", body: formData });
      await refresh();
      toast.success("Your profile photo has been updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="group relative h-14 w-14 shrink-0">
      <Avatar className="h-14 w-14">
        <AvatarImage src={previewUrl ?? user.photoUrl} alt={user.name} />
        <AvatarFallback className="bg-accent text-accent-foreground">{initials(user.name)}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Update profile photo"
        className={cn(
          "absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100",
          uploading && "opacity-100",
        )}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
    </div>
  );
}

function EditProfileSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, refresh } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? "");
    }
  }

  const canSubmit = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 6;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      await refresh();
      toast.success("Your details have been updated.");
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
          <SheetTitle>Personal Information</SheetTitle>
          <SheetDescription>Update your name, email and phone number.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4">
          {user && (
            <div className="flex items-center gap-3">
              <ProfilePhotoUploader user={user} />
              <div>
                <p className="text-sm font-medium">Profile photo</p>
                <p className="text-xs text-muted-foreground">Hover the photo and click to change it.</p>
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="settings-name">Full name</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-phone">Phone number</Label>
            <Input id="settings-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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

export default function SettingsPage() {
  const { user } = useSession();
  const { credential, loading: credentialLoading } = useCredential();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and keep your information secure.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              <button
                onClick={() => setProfileOpen(true)}
                className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Personal Information</p>
                  <p className="text-xs text-muted-foreground">Update your name, email and phone number.</p>
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

              <button
                onClick={notAvailable}
                className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <Badge variant="secondary" className="text-[10px]">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">Not enabled</span>
              </button>

              <button
                onClick={notAvailable}
                className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Laptop className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">Manage devices where your account is currently logged in.</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <ProfilePhotoUploader user={user} />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Member ID</p>
                  <p className="font-medium text-primary">{credential?.credentialCode ?? "Pending"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium">{credential?.issuedAt ? formatDate(credential.issuedAt) : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AccessStatusCard credential={credential} userStatus={user.status} loading={credentialLoading} />
        </div>
      </div>

      <EditProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordSheet open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  );
}
