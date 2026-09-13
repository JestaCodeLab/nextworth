import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon?: boolean;
}

export function PlaceholderPage({ icon: Icon, title, description, comingSoon }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {comingSoon && <Badge variant="secondary">Coming soon</Badge>}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            {comingSoon
              ? "This feature is part of a later Nexworth release and isn't available yet."
              : "Nothing to show here yet — this will populate once the underlying data is live."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
