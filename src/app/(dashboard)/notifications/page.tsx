"use client";

import { toast } from "react-toastify";
import { Bell, Tag, ShieldCheck, Store, Receipt, Headset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { apiFetch, ApiError } from "@/lib/api";
import type { NotificationPreferences } from "@/lib/types";

const preferenceRows: { key: keyof NotificationPreferences; icon: typeof Tag; title: string; description: string }[] = [
  { key: "offersAndPromotions", icon: Tag, title: "Offers & Promotions", description: "New deals, partner offers and discounts." },
  { key: "accountUpdates", icon: ShieldCheck, title: "Account Updates", description: "Important updates about your account and credential." },
  { key: "newPartners", icon: Store, title: "New Partners", description: "Updates about new merchants on Nexworth." },
  { key: "reminders", icon: Bell, title: "Reminders", description: "Reminders about offers and important dates." },
  { key: "transactions", icon: Receipt, title: "Transactions", description: "Alerts for redemptions and savings." },
];

export default function NotificationsPage() {
  const { user, refresh } = useSession();

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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Stay updated with important alerts, offers and account updates.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Bell className="h-6 w-6" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                You&apos;re all caught up — notifications will show up here once there&apos;s activity on your account.
              </p>
            </CardContent>
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
              <Button variant="outline" className="w-full" render={<a href="/support" />}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
