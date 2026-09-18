"use client";

import { Input } from "@/components/ui/input";

export const MARKET_CALLING_CODES: Record<"GH" | "UK", string> = {
  GH: "+233",
  UK: "+44",
};

interface PhoneInputProps {
  id?: string;
  market: "GH" | "UK";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** A local-number field with the market's calling code shown as a fixed prefix. */
export function PhoneInput({ id, market, value, onChange, placeholder }: PhoneInputProps) {
  return (
    <div className="flex items-center rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <span className="flex h-10 shrink-0 items-center border-r border-input px-3.5 text-base text-muted-foreground">
        {MARKET_CALLING_CODES[market]}
      </span>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder ?? "551234567"}
        className="border-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
      />
    </div>
  );
}
