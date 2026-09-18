"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, Clock, Settings, LogOut, Bell, ChevronDown, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { apiFetch } from "@/lib/api";
import { useNotifications } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SessionUser, UserStatus, MerchantStatus } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const statusIcon: Record<UserStatus, LucideIcon> = {
  verified: ShieldCheck,
  pending: Clock,
  rejected: ShieldAlert,
};

// A merchant login's own User.status is always "verified" (that field
// tracks member KYC, which doesn't apply to merchants) — the topbar's status
// pill for a merchant instead reflects the Merchant record's own admin-review
// status, so "Account Verified" isn't shown while an application is still
// pending/rejected/suspended.
const merchantStatusIcon: Record<MerchantStatus, LucideIcon> = {
  active: ShieldCheck,
  pending: Clock,
  inactive: ShieldAlert,
  rejected: ShieldAlert,
};

const merchantStatusLabel: Record<MerchantStatus, string> = {
  active: "Application Approved",
  pending: "Pending Review",
  inactive: "Suspended",
  rejected: "Rejected",
};

export function Topbar({ user }: { user: SessionUser }) {
  const router = useRouter();
  const isMerchant = user.role === "merchant";
  const merchantStatus = user.merchantStatus ?? "pending";
  const StatusIcon = isMerchant ? merchantStatusIcon[merchantStatus] : statusIcon[user.status];
  const { notifications, unreadCount, refresh, markRead } = useNotifications();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      router.push("/sign-in");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex h-18 items-center justify-between gap-3 border-b bg-background px-8">
      {isMerchant ? (
        merchantStatus === "active" ? (
          <span className="flex items-center gap-1.5 text-base font-medium text-primary">
            <StatusIcon className="h-5 w-5" /> {merchantStatusLabel[merchantStatus]}
          </span>
        ) : (
          <Badge variant="outline" className="text-sm">
            <StatusIcon className="h-4 w-4" />
            {merchantStatusLabel[merchantStatus]}
          </Badge>
        )
      ) : user.status === "verified" ? (
        <span className="flex items-center gap-1.5 text-base font-medium text-primary">
          <StatusIcon className="h-5 w-5" /> Account Verified
        </span>
      ) : (
        <Badge variant="outline" className="capitalize text-sm">
          <StatusIcon className="h-4 w-4" />
          {user.status}
        </Badge>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu onOpenChange={(open) => open && refresh()}>
            <DropdownMenuTrigger className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-foreground/80 transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <p className="px-2 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex-col items-start gap-0.5 whitespace-normal"
                      onClick={() => !notification.read && markRead(notification.id)}
                    >
                      <span className="flex w-full items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", !notification.read && "bg-primary")} />
                        <span className="text-sm font-medium">{notification.title}</span>
                      </span>
                      <span className="pl-3.5 text-xs text-muted-foreground">{notification.body}</span>
                      <span className="pl-3.5 text-[10px] text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/notifications")} className="justify-center text-sm font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg py-1 pl-1 pr-2.5 transition-colors hover:bg-muted">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-medium">{user.name.split(" ")[0]}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 space-y-1">
            <div className="flex flex-col gap-0.5 px-2 py-2">
              <p className="truncate text-base font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2.5 text-base" onClick={() => router.push("/settings")}>
              <Settings className="h-5 w-5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" className="cursor-pointer py-2.5 text-base" onClick={() => setConfirmLogoutOpen(true)}>
              <LogOut className="h-5 w-5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>You&apos;ll need to sign in again to access your account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
