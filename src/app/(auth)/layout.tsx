"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowLeft, ChevronDown, Globe, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMounted } from "@/hooks/use-mounted";
import {
  ShieldCheck,
  Tag,
  Globe2,
  Lock,
  Mail,
  ShieldQuestion,
  Clock,
  Headset,
  Users,
  Store,
  Receipt,
  Percent,
  MapPin,
  Smartphone,
} from "lucide-react";

interface Highlight {
  icon: LucideIcon;
  title: string;
  body: string;
}

const panelContent: Record<string, { badge?: string; heading: React.ReactNode; body: string; highlights: Highlight[] }> = {
  "/sign-up": {
    badge: "Create your Nexworth account",
    heading: (
      <>
        One Account. <span className="text-violet-400">Endless Opportunities.</span>
      </>
    ),
    body: "Join verified users accessing exclusive benefits, services and experiences across Ghana and the UK.",
    highlights: [
      { icon: ShieldCheck, title: "Verified Access", body: "Your identity is verified once and you're good to go." },
      { icon: Tag, title: "Exclusive Benefits", body: "Enjoy discounts and privileges from trusted partners." },
      { icon: Globe2, title: "Wide Network", body: "Access opportunities across Ghana and the UK." },
      { icon: Lock, title: "Secure & Private", body: "Your data is protected with industry-leading security." },
    ],
  },
  "/sign-in": {
    heading: (
      <>
        Access more. Unlock opportunities. <span className="text-violet-400">Anywhere.</span>
      </>
    ),
    body: "Nexworth is your digital credential to exclusive benefits, services and opportunities across Ghana and the UK.",
    highlights: [
      { icon: ShieldCheck, title: "Verified Access", body: "Your credential. Your identity. Verified." },
      { icon: Tag, title: "Exclusive Benefits", body: "Enjoy discounts and privileges every day." },
      { icon: Globe2, title: "Wide Network", body: "Access merchants across Ghana & the UK." },
      { icon: Lock, title: "Secure & Private", body: "Your data is protected with industry-leading security." },
    ],
  },
  "/admin-login": {
    badge: "Nexworth admin console",
    heading: (
      <>
        Manage Nexworth. <span className="text-violet-400">Securely.</span>
      </>
    ),
    body: "Review KYC applications, onboard merchants, track transactions, and manage market pricing.",
    highlights: [
      { icon: Users, title: "User Review", body: "Approve or reject identity verification." },
      { icon: Store, title: "Merchant Onboarding", body: "Add and manage participating merchants." },
      { icon: Receipt, title: "Transactions", body: "See every card-fee payment, confirmed by Paystack." },
      { icon: Lock, title: "Restricted Access", body: "Admin accounts only." },
    ],
  },
  "/forgot-password": {
    heading: (
      <>
        Reset your password. <span className="text-violet-400">Regain access.</span>
      </>
    ),
    body: "No worries — it happens. Enter your email and we'll send you a link to reset your password.",
    highlights: [
      { icon: Mail, title: "Quick & Secure", body: "Reset your password in a few simple steps." },
      { icon: ShieldQuestion, title: "Your Account, Safe", body: "We use industry-leading security to protect you." },
      { icon: Clock, title: "24/7 Access", body: "Reset anytime, anywhere, and get back in instantly." },
      { icon: Headset, title: "Need Help?", body: "Our support team is always here for you." },
    ],
  },
  "/merchant-signup": {
    badge: "Become a Nexworth partner",
    heading: (
      <>
        Reach verified members. <span className="text-violet-400">Grow your business.</span>
      </>
    ),
    body: "Register your business, set the discount you're offering, and get discovered by Nexworth members across Ghana and the UK.",
    highlights: [
      { icon: Percent, title: "You set the discount", body: "Offer whatever percentage works for your business." },
      { icon: Users, title: "Verified members", body: "Every member is identity-verified before they can join." },
      { icon: MapPin, title: "Get discovered", body: "Show up on Find Merchants once your listing is approved." },
      { icon: ShieldCheck, title: "Quick review", body: "Our team reviews new listings before they go live." },
    ],
  },
  "/merchant-verify-contact": {
    badge: "Almost there",
    heading: (
      <>
        Confirm it&apos;s you. <span className="text-violet-400">Then step inside.</span>
      </>
    ),
    body: "A quick code by text or email confirms you own the contact details on file before you enter your portal.",
    highlights: [
      { icon: ShieldCheck, title: "One-time code", body: "Expires in 10 minutes for your security." },
      { icon: Smartphone, title: "Your choice", body: "Verify by text or email — whichever's easiest." },
      { icon: Lock, title: "Secure & Private", body: "Your data is protected with industry-leading security." },
    ],
  },
  "/reset-password": {
    heading: (
      <>
        Almost there. <span className="text-violet-400">Set your password.</span>
      </>
    ),
    body: "Choose a password to activate your Nexworth account and get started.",
    highlights: [
      { icon: ShieldCheck, title: "Verified Access", body: "Your credential. Your identity. Verified." },
      { icon: Tag, title: "Exclusive Benefits", body: "Enjoy discounts and privileges every day." },
      { icon: Globe2, title: "Wide Network", body: "Access merchants across Ghana & the UK." },
      { icon: Lock, title: "Secure & Private", body: "Your data is protected with industry-leading security." },
    ],
  },
};

function HeaderRight({ pathname }: { pathname: string }) {
  if (pathname === "/sign-up") {
    return (
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    );
  }

  if (pathname === "/forgot-password" || pathname === "/admin-login") {
    return (
      <Link href="/sign-in" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    );
  }

  // Sign-in: a cosmetic language selector — no i18n is wired up yet.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm text-muted-foreground">
        <Globe className="h-4 w-4" />
        English
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>English</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const content = panelContent[pathname] ?? panelContent["/sign-in"];
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/nexworth_brand_logos/nexworth-logo-white.png"
      : "/nexworth_brand_logos/nexworth-logo-blue.png";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-20 shrink-0 items-center justify-between border-b px-6 sm:px-10">
        <Link href="/sign-in">
          <Image src={logoSrc} alt="Nexworth" width={150} height={24} priority />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <HeaderRight pathname={pathname} />
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-2">
        <div className="relative hidden flex-col justify-center overflow-hidden bg-[#160b36] p-10 text-white lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, oklch(0.541 0.281 293.009 / 0.35), transparent 55%), radial-gradient(circle at 80% 70%, oklch(0.38 0.189 293.745 / 0.4), transparent 55%)",
            }}
          />
          <div className="relative z-10">
            {content.badge && (
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-200">
                {content.badge}
              </span>
            )}
            <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">{content.heading}</h1>
            <p className="mt-4 max-w-sm text-white/70">{content.body}</p>
          </div>

          <div className="relative z-10 mt-16 grid gap-5">
            {content.highlights.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-white/60">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-2 border-t px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:px-10">
        <p>© {new Date().getFullYear()} Nexworth. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>Terms of Use</span>
          <span>Privacy Policy</span>
          <span>Help Center</span>
        </div>
      </footer>
    </div>
  );
}
