import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function AdminUsersPage() {
  return (
    <PlaceholderPage
      icon={Users}
      title="Users & Credentials"
      description="Review applications, approve or reject documents, and manage credential status."
    />
  );
}
