"use client";

import { cn } from "@/lib/utils";

const DISCOUNT_OPTIONS = [5, 10, 15, 20] as const;

interface DiscountPickerProps {
  value: string;
  onChange: (value: string) => void;
}

/** A set of preset discount percentages a merchant picks from, instead of a free-form number field. */
export function DiscountPicker({ value, onChange }: DiscountPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {DISCOUNT_OPTIONS.map((option) => {
        const selected = value === String(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(String(option))}
            className={cn(
              "cursor-pointer rounded-lg border py-2.5 text-center text-base font-semibold transition-colors",
              selected ? "border-primary bg-accent text-primary" : "hover:bg-muted/50",
            )}
          >
            {option}%
          </button>
        );
      })}
    </div>
  );
}
