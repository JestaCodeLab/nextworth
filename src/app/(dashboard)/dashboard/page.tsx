"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin, Tag, Receipt, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CredentialCard } from "@/components/credential/credential-card";
import { AccessStatusCard } from "@/components/dashboard/access-status-card";
import { useSession } from "@/hooks/use-session";
import { useCredential } from "@/hooks/use-credential";
import { apiFetch } from "@/lib/api";
import { MARKET_DEFAULT_VIEW } from "@/lib/city-coordinates";
import type { MapMerchant } from "@/components/find-merchants/merchants-map";

const MerchantsMap = dynamic(() => import("@/components/find-merchants/merchants-map").then((m) => m.MerchantsMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-80 w-full rounded-xl" />,
});

interface DashboardMerchant {
  id: string;
  name: string;
  category: string;
  country: "GH" | "UK";
  discountPercent?: number;
  locations: { city?: string }[];
}

const quickActions = [
  { label: "Find Merchants", icon: MapPin, href: "/find-merchants" },
  { label: "Browse Benefits", icon: Tag, href: "/benefits" },
  { label: "My Transactions", icon: Receipt, href: "/transactions" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
];

export default function DashboardPage() {
  const { user } = useSession();
  const { credential, loading: credentialLoading } = useCredential();
  const [merchants, setMerchants] = useState<DashboardMerchant[] | null>(null);

  useEffect(() => {
    apiFetch<{ merchants: DashboardMerchant[] }>("/merchants")
      .then((data) => setMerchants(data.merchants))
      .catch(() => setMerchants([]));
  }, []);

  const nearbyMerchants: MapMerchant[] = useMemo(() => {
    if (!merchants || !user?.country) return [];
    return merchants
      .filter((m) => m.country === user.country && m.locations[0]?.city)
      .map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        discountPercent: m.discountPercent,
        city: m.locations[0]!.city!,
        country: m.country,
      }));
  }, [merchants, user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-8xl space-y-6">
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

        <div className="flex flex-col gap-6">
          <AccessStatusCard credential={credential} userStatus={user.status} loading={credentialLoading} />

          <Card className="flex flex-1 flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Nearby Merchants</CardTitle>
              <Link href="/find-merchants" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="flex-1">
              {!merchants ? (
                <Skeleton className="h-full min-h-80 w-full rounded-xl" />
              ) : (
                <div className="h-full min-h-80">
                  <MerchantsMap
                    merchants={nearbyMerchants}
                    defaultCenter={user.country ? MARKET_DEFAULT_VIEW[user.country] : undefined}
                    defaultZoom={user.country ? 13 : undefined}
                    lockToDefaultView={Boolean(user.country)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
