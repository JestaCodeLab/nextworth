import { Receipt } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function TransactionsPage() {
  return (
    <PlaceholderPage
      icon={Receipt}
      title="Transactions"
      description="A record of your redemptions and card activity."
    />
  );
}
