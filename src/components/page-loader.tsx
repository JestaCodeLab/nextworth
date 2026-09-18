"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

/** Full-screen loading gate shown while a session/role check resolves — used by every authenticated layout. */
export function PageLoader() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/nexworth_brand_logos/nexworth-logo-white.png"
      : "/nexworth_brand_logos/nexworth-logo-blue.png";

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
      <Image src={logoSrc} alt="Nexworth" width={120} height={19} priority />
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
