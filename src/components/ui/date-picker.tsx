"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  /** When set, renders a hidden input so a surrounding <form>'s FormData picks up the value. */
  name?: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
  className?: string;
}

/**
 * The standard date picker for this app — a popover calendar, not the
 * native <input type="date">, whose picker UI varies wildly across
 * browsers/OSes and can't be styled to match the rest of the design system.
 */
export function DatePicker({
  name,
  value,
  onChange,
  placeholder = "Select a date",
  disabled,
  captionLayout = "dropdown",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={value ? format(value, "yyyy-MM-dd") : ""} />}
      <PopoverTrigger
        type="button"
        className={cn(
          "border-input flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          !value && "text-muted-foreground",
          className,
        )}
      >
        {value ? format(value, "d MMMM yyyy") : placeholder}
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout={captionLayout}
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
