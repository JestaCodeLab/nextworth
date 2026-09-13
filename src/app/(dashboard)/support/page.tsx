import { Headphones } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">We&apos;re here to help. Get quick answers or contact our support team.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Need help?</CardTitle>
            <CardDescription>Email support@nexworth.com and we typically respond within 24 hours.</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
