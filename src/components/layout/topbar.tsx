import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SessionUser } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ user }: { user: SessionUser }) {
  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-background px-8">
      {user.status === "verified" ? (
        <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4" /> Account Verified
        </span>
      ) : (
        <Badge variant="outline" className="capitalize">
          {user.status}
        </Badge>
      )}
      <ThemeToggle />
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.name}</span>
      </div>
    </header>
  );
}
