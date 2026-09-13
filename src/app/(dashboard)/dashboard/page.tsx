"use client";

import Link from "next/link";
import { MapPin, Tag, Receipt, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialCard } from "@/components/credential/credential-card";
import { AccessStatusCard } from "@/components/dashboard/access-status-card";
import { useSession } from "@/hooks/use-session";
import { useCredential } from "@/hooks/use-credential";

const quickActions = [
  { label: "Find Merchants", icon: MapPin, href: "/find-merchants" },
  { label: "Browse Benefits", icon: Tag, href: "/benefits" },
  { label: "My Transactions", icon: Receipt, href: "/transactions" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
];

export default function DashboardPage() {
  const { user } = useSession();
  const { credential } = useCredential();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {credential
            ? "Here's what's happening with your Nexworth account."
            : "Your application is being reviewed — we'll notify you once it's approved."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CredentialCard user={user} credential={credential} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Latest Offers for You</CardTitle>
              <Link href="/benefits" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Tag className="h-5 w-5" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                Individual merchant offers aren&apos;t live yet — this fills in once the benefits directory ships.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AccessStatusCard credential={credential} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Nearby Merchants</CardTitle>
              <Link href="/find-merchants" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                The merchant map isn&apos;t live yet — check back soon.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-[#0f0a2e] text-white">
            <CardContent className="p-5">
              <p className="font-semibold">Unlock more savings</p>
              <p className="mt-1 text-sm text-white/70">New partners. More benefits. Better opportunities for you.</p>
              <Link
                href="/benefits"
                className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0f0a2e] transition-opacity hover:opacity-90"
              >
                Explore Benefits
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
