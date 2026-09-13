"use client";

import { useTheme } from "next-themes";
import { ToastContainer, type IconProps } from "react-toastify";
import { Check, Info, X } from "lucide-react";

const ICON_CIRCLE = "flex h-14 w-14 shrink-0 items-center justify-center rounded-full";

const ICONS: Record<IconProps["type"], { render: () => React.ReactNode; className: string }> = {
  success: { render: () => <Check className="h-6 w-6" strokeWidth={2.75} />, className: "bg-success text-black/75" },
  error: { render: () => <X className="h-6 w-6" strokeWidth={2.75} />, className: "bg-destructive text-black/75" },
  warning: {
    render: () => <span className="text-2xl leading-none font-black">!</span>,
    className: "bg-warning text-black/75",
  },
  info: { render: () => <Info className="h-6 w-6" strokeWidth={2.75} />, className: "bg-primary text-primary-foreground" },
  default: {
    render: () => <Info className="h-6 w-6" strokeWidth={2.75} />,
    className: "bg-primary text-primary-foreground",
  },
};

function ToastIcon({ type }: IconProps) {
  const { render, className } = ICONS[type];
  return <span className={`${ICON_CIRCLE} ${className}`}>{render()}</span>;
}

export function ThemeToastContainer() {
  const { resolvedTheme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      closeOnClick
      closeButton={false}
      hideProgressBar
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      icon={ToastIcon}
    />
  );
}
