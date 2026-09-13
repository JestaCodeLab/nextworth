"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  IdCard,
  Tag,
  MapPin,
  Receipt,
  Bell,
  Settings,
  Headphones,
  LogOut,
  ShieldCheck,
  Users,
  Store,
  type LucideIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const userNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/credential", label: "My Credential", icon: IdCard },
  { href: "/benefits", label: "Benefits", icon: Tag },
  { href: "/find-merchants", label: "Find Merchants", icon: MapPin },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: Headphones },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Credentials", icon: Users },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
];

export function Sidebar({ variant = "user" }: { variant?: "user" | "admin" }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = variant === "admin" ? adminNav : userNav;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between bg-[#0f0a2e] px-4 py-6 text-white">
      <div>
        <Link href={variant === "admin" ? "/admin" : "/dashboard"} className="block px-2">
          <Image src="/nexworth_brand_logos/nexworth-logo-white.png" alt="Nexworth" width={140} height={22} priority />
        </Link>
        {variant === "admin" && (
          <p className="mt-1 flex items-center gap-1 px-2 text-xs text-white/50">
            <ShieldCheck className="h-3 w-3" /> Admin console
          </p>
        )}

        <nav className="mt-8 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-violet-600 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={async () => {
          await apiFetch("/auth/logout", { method: "POST" });
          router.push("/sign-in");
        }}
        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
