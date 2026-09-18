"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import {
  MapPin,
  Map as MapIcon,
  LayoutList,
  Search,
  Store,
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Shirt,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Clapperboard,
  Plane,
  Cpu,
  Car,
  GraduationCap,
  Sofa,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/ui/loading-states";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/hooks/use-session";
import { apiFetch, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MERCHANT_CATEGORIES } from "@/lib/merchant-categories";
import { MARKET_DEFAULT_VIEW } from "@/lib/city-coordinates";
import type { MapMerchant } from "@/components/find-merchants/merchants-map";

const MerchantsMap = dynamic(() => import("@/components/find-merchants/merchants-map").then((m) => m.MerchantsMap), {
  ssr: false,
  loading: () => <Skeleton className="h-140 w-full rounded-xl" />,
});

const selectClassName =
  "border-input flex h-10 cursor-pointer rounded-lg border bg-transparent px-3.5 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

interface MerchantLocation {
  label: string;
  address?: string;
  city?: string;
  country: string;
  mapsUrl?: string;
}

interface PublicMerchant {
  id: string;
  name: string;
  category: string;
  description?: string;
  logoUrl?: string;
  country: "GH" | "UK";
  discountPercent?: number;
  locations: MerchantLocation[];
}

const categoryIcons: Record<string, LucideIcon> = {
  "Restaurant": Utensils,
  "Grocery & Supermarket": ShoppingCart,
  "Retail & Shopping": ShoppingBag,
  "Fashion & Apparel": Shirt,
  "Beauty & Spa": Sparkles,
  "Health & Wellness": HeartPulse,
  "Fitness & Gym": Dumbbell,
  "Entertainment & Leisure": Clapperboard,
  "Travel & Hospitality": Plane,
  "Electronics & Tech": Cpu,
  "Automotive": Car,
  "Education": GraduationCap,
  "Home & Furniture": Sofa,
};

const marketLabel: Record<"GH" | "UK", string> = { GH: "Ghana", UK: "United Kingdom" };

function MerchantCard({ merchant }: { merchant: PublicMerchant }) {
  const Icon = categoryIcons[merchant.category] ?? Store;
  const location = merchant.locations[0];

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="h-5 w-5" />
          </div>
          {merchant.discountPercent !== undefined && (
            <Badge className="border-success/20 bg-success/15 text-sm font-semibold text-success">
              {merchant.discountPercent}% off
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-semibold">{merchant.name}</h3>
          {merchant.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{merchant.description}</p>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
          <Badge variant="outline">{merchant.category}</Badge>
          {location ? (
            location.mapsUrl ? (
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {location.city ?? marketLabel[merchant.country]}
              </a>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {location.city ?? marketLabel[merchant.country]}
              </span>
            )
          ) : (
            <span className="text-muted-foreground">{marketLabel[merchant.country]}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasAnyMerchants }: { hasAnyMerchants: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Store className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasAnyMerchants ? "No merchants match these filters." : "No participating merchants yet — check back soon."}
      </p>
    </div>
  );
}

export default function FindMerchantsPage() {
  const { user } = useSession();
  const [merchants, setMerchants] = useState<PublicMerchant[] | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState<"all" | "GH" | "UK">("all");
  const [view, setView] = useState<"list" | "map">("list");

  useEffect(() => {
    apiFetch<{ merchants: PublicMerchant[] }>("/merchants")
      .then((data) => setMerchants(data.merchants))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Couldn't load merchants."));
  }, []);

  useEffect(() => {
    if (user?.country) setMarketFilter(user.country);
  }, [user?.country]);

  const filteredMerchants = useMemo(() => {
    if (!merchants) return null;
    const query = search.trim().toLowerCase();
    return merchants.filter((merchant) => {
      if (categoryFilter !== "all" && merchant.category !== categoryFilter) return false;
      if (marketFilter !== "all" && merchant.country !== marketFilter) return false;
      if (query && !merchant.name.toLowerCase().includes(query) && !merchant.category.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [merchants, search, categoryFilter, marketFilter]);

  const mapMerchants: MapMerchant[] = useMemo(
    () =>
      (filteredMerchants ?? [])
        .filter((merchant) => merchant.locations[0]?.city)
        .map((merchant) => ({
          id: merchant.id,
          name: merchant.name,
          category: merchant.category,
          discountPercent: merchant.discountPercent,
          city: merchant.locations[0]!.city!,
          country: merchant.country,
        })),
    [filteredMerchants],
  );

  return (
    <div className="mx-auto flex max-w-8xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Find Merchants</h1>
        <p className="mt-1 text-sm text-muted-foreground">Discover participating merchants near you, with your available discount.</p>
      </div>

      <div className="sticky top-0 z-10 -mx-8 flex flex-wrap items-center gap-3 bg-background px-8 py-3 shadow-sm">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category"
            className="bg-background pl-10"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={cn(selectClassName, "bg-background")}>
          <option value="all">All categories</option>
          {MERCHANT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value as typeof marketFilter)}
          className={cn(selectClassName, "bg-background")}
        >
          <option value="all">All markets</option>
          <option value="GH">Ghana</option>
          <option value="UK">United Kingdom</option>
        </select>
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
          <TabsList>
            <TabsTrigger value="list" className="gap-1.5">
              <LayoutList className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5">
              <MapIcon className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!filteredMerchants ? (
        view === "map" ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-140 w-full rounded-xl lg:sticky lg:top-20 lg:h-[calc(100vh-9rem)]" />
            <CardGridSkeleton count={4} className="sm:grid-cols-2 lg:grid-cols-2" />
          </div>
        ) : (
          <CardGridSkeleton count={6} />
        )
      ) : view === "map" ? (
        <div className={cn("grid gap-5", filteredMerchants.length > 0 && "lg:grid-cols-2")}>
          <div className="h-140 lg:sticky lg:top-20 lg:h-[calc(100vh-9rem)]">
            <MerchantsMap
              merchants={mapMerchants}
              defaultCenter={user?.country ? MARKET_DEFAULT_VIEW[user.country] : undefined}
              defaultZoom={user?.country ? 11 : undefined}
              lockToDefaultView={Boolean(user?.country)}
            />
          </div>
          {filteredMerchants.length === 0 ? (
            <EmptyState hasAnyMerchants={Boolean(merchants?.length)} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredMerchants.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant} />
              ))}
            </div>
          )}
        </div>
      ) : filteredMerchants.length === 0 ? (
        <EmptyState hasAnyMerchants={Boolean(merchants?.length)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMerchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}
    </div>
  );
}
