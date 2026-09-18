"use client";

import { useTheme } from "next-themes";
import { ToastContainer, type IconProps } from "react-toastify";
import { CheckCircle2, XCircle, TriangleAlert, Info } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";

const ICON_TILE = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full";

const ICONS: Record<IconProps["type"], { render: () => React.ReactNode; className: string }> = {
  success: {
    render: () => <CheckCircle2 className="h-5 w-5" />,
    className: "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  error: {
    render: () => <XCircle className="h-5 w-5" />,
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
  warning: {
    render: () => <TriangleAlert className="h-5 w-5" />,
    className: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  info: {
    render: () => <Info className="h-5 w-5" />,
    className: "bg-primary/10 text-primary",
  },
  default: {
    render: () => <Info className="h-5 w-5" />,
    className: "bg-primary/10 text-primary",
  },
};

function ToastIcon({ type }: IconProps) {
  const { render, className } = ICONS[type];
  return <span className={`${ICON_TILE} ${className}`}>{render()}</span>;
}

export function ThemeToastContainer() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      closeOnClick
      closeButton={false}
      hideProgressBar
      theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
      icon={ToastIcon}
    />
  );
}
