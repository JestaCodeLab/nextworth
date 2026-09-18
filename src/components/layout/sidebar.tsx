"use client";

import { useState } from "react";
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
  Megaphone,
  Smartphone,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
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
];

const userBottomNav: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: Headphones },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Credentials", icon: Users },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
  { href: "/admin/communication", label: "Communication", icon: Megaphone },
  { href: "/admin/delivery-report", label: "Delivery Report", icon: Smartphone },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const merchantNav: NavItem[] = [
  { href: "/merchant/redeem", label: "Redeem", icon: ScanLine },
  { href: "/merchant/discounts", label: "Discounts", icon: Tag },
];

const merchantBottomNav: NavItem[] = [{ href: "/merchant/settings", label: "Settings", icon: Settings }];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
        active ? "bg-violet-600 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

export function Sidebar({ variant = "user" }: { variant?: "user" | "admin" | "merchant" }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = variant === "admin" ? adminNav : variant === "merchant" ? merchantNav : userNav;
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
    <aside className="flex h-screen w-72 shrink-0 flex-col justify-between bg-[#0f0a2e] px-4 py-6 text-white">
      <div>
        <Link
          href={variant === "admin" ? "/admin" : variant === "merchant" ? "/merchant/redeem" : "/dashboard"}
          className="block px-2"
        >
          <Image src="/nexworth_brand_logos/nexworth-logo-white.png" alt="Nexworth" width={160} height={26} priority />
        </Link>
        {variant === "admin" && (
          <p className="mt-1.5 flex items-center gap-1.5 px-2 text-sm text-white/50">
            <ShieldCheck className="h-4 w-4" /> Admin console
          </p>
        )}
        {variant === "merchant" && (
          <p className="mt-1.5 flex items-center gap-1.5 px-2 text-sm text-white/50">
            <Store className="h-4 w-4" /> Merchant portal
          </p>
        )}

        <nav className="mt-8 space-y-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
      </div>

      {variant === "user" ? (
        <nav className="space-y-1">
          {userBottomNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
      ) : variant === "merchant" ? (
        <nav className="space-y-1">
          {merchantBottomNav.map((item) => (
            <NavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
          <button
            onClick={() => setConfirmLogoutOpen(true)}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </nav>
      ) : (
        <button
          onClick={() => setConfirmLogoutOpen(true)}
          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      )}

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
    </aside>
  );
}
