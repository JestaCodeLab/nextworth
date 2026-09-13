"use client";

import { toast } from "react-toastify";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  ShieldCheck,
  Laptop,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AccessStatusCard } from "@/components/dashboard/access-status-card";
import { useSession } from "@/hooks/use-session";
import { useCredential } from "@/hooks/use-credential";
import { formatDate } from "@/lib/format";

function notAvailable() {
  toast.info("This isn't available yet in this build.");
}

const accountRows = [
  { icon: UserIcon, title: "Personal Information", description: "Update your name, email, phone number, date of birth and address." },
  { icon: Mail, title: "Email Address", description: "Update your email address." },
  { icon: Phone, title: "Phone Number", description: "Update your phone number." },
  { icon: Calendar, title: "Date of Birth", description: "Update your date of birth." },
  { icon: MapPin, title: "Address", description: "Update your residential address." },
];

export default function SettingsPage() {
  const { user } = useSession();
  const { credential } = useCredential();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and keep your information secure.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {accountRows.map(({ icon: Icon, title, description }) => (
                <button
                  key={title}
                  onClick={notAvailable}
                  className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              <button
                onClick={notAvailable}
                className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Change Password</p>
                  <p className="text-xs text-muted-foreground">Update your account password.</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>

              <button
                onClick={notAvailable}
                className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <Badge variant="secondary" className="text-[10px]">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">Not enabled</span>
              </button>

              <button
                onClick={notAvailable}
                className="flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Laptop className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">Manage devices where your account is currently logged in.</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.photoUrl} alt={user.name} />
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {user.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Member ID</p>
                  <p className="font-medium text-primary">{credential?.credentialCode ?? "Pending"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium">{credential ? formatDate(credential.issuedAt) : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AccessStatusCard credential={credential} />
        </div>
      </div>
    </div>
  );
}
