export type Market = "GH" | "UK";
export type UserRole = "user" | "admin";
export type UserStatus = "pending" | "verified" | "rejected";

export type OnboardingStep = "verification" | "welcome" | "complete";

export interface NotificationPreferences {
  offersAndPromotions: boolean;
  accountUpdates: boolean;
  newPartners: boolean;
  reminders: boolean;
  transactions: boolean;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  photoUrl?: string;
  status: UserStatus;
  role: UserRole;
  country?: Market;
  onboardingStep: OnboardingStep;
  notificationPreferences: NotificationPreferences;
}

export type CredentialStatus = "pending" | "active" | "suspended" | "expired";

export interface Credential {
  id: string;
  credentialId: string;
  credentialCode: string;
  qrPayload: string;
  status: CredentialStatus;
  market: Market;
  issuedAt: string;
  expiresAt: string;
}
