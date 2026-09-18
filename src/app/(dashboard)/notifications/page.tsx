"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Bell, Tag, ShieldCheck, Store, Receipt, Headset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/loading-states";
import { useSession } from "@/hooks/use-session";
import { useNotifications } from "@/hooks/use-notifications";
import { apiFetch, ApiError } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationPreferences } from "@/lib/types";

const preferenceRows: { key: keyof NotificationPreferences; icon: typeof Tag; title: string; description: string }[] = [
  // { key: "offersAndPromotions", icon: Tag, title: "Offers & Promotions", description: "New deals, partner offers and discounts." },
  { key: "accountUpdates", icon: ShieldCheck, title: "Account Updates", description: "Important updates about your account and credential." },
  // { key: "newPartners", icon: Store, title: "New Partners", description: "Updates about new merchants on Nexworth." },
  { key: "reminders", icon: Bell, title: "Reminders", description: "Reminders about offers and important dates." },
  { key: "transactions", icon: Receipt, title: "Transactions", description: "Alerts for redemptions and savings." },
];

export default function NotificationsPage() {
  const { user, refresh } = useSession();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [tab, setTab] = useState<"all" | "unread">("all");

  async function handleToggle(key: keyof NotificationPreferences, value: boolean) {
    try {
      await apiFetch<{ notificationPreferences: NotificationPreferences }>("/users/me/notification-preferences", {
        method: "PATCH",
        body: JSON.stringify({ [key]: value }),
      });
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save that preference. Please try again.");
    }
  }

  if (!user) return null;

  const visibleNotifications = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Stay updated with important alerts, offers and account updates.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <Tabs value={tab} onValueChange={(value) => setTab(value as "all" | "unread")}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}</TabsTrigger>
                </TabsList>
              </Tabs>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  Mark all as read
                </Button>
              )}
            </CardHeader>
            {loading ? (
              <CardContent className="p-0">
                <ListSkeleton rows={5} />
              </CardContent>
            ) : visibleNotifications.length === 0 ? (
              <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Bell className="h-6 w-6" />
                </div>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {tab === "unread"
                    ? "No unread notifications."
                    : "You're all caught up — notifications will show up here once there's activity on your account."}
                </p>
              </CardContent>
            ) : (
              <CardContent className="divide-y p-0">
                {visibleNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => !notification.read && markRead(notification.id)}
                    className="flex w-full cursor-pointer items-start gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        notification.read ? "bg-transparent" : "bg-primary",
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{notification.body}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </button>
                ))}
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to hear about.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {preferenceRows.map(({ key, icon: Icon, title, description }) => (
                <div key={key} className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={user.notificationPreferences[key]}
                    onCheckedChange={(value) => handleToggle(key, value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Need help?</CardTitle>
                <CardDescription>If you have any issues, our support team is here to help.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" render={<a href="/support" />} nativeButton={false}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
