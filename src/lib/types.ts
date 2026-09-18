export type Market = "GH" | "UK";
export type UserRole = "user" | "admin" | "merchant";
export type UserStatus = "pending" | "verified" | "rejected";
export type MerchantStatus = "pending" | "active" | "inactive" | "rejected";

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
  rejectionReason?: string;
  role: UserRole;
  country?: Market;
  onboardingStep: OnboardingStep;
  notificationPreferences: NotificationPreferences;
  // Set only when role === "merchant" — the Merchant this login manages.
  merchantId?: string;
  // Whether this login has completed phone/email OTP verification — gates
  // portal entry entirely. Distinct from merchantStatus (the Merchant
  // record's own admin-review status, which gates adding discount codes).
  merchantContactVerified?: boolean;
  merchantStatus?: MerchantStatus;
}

export type NotificationType =
  | "profile_updated"
  | "password_changed"
  | "generic"
  | "merchant_discount_code_expiring"
  | "merchant_application_approved";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export type CredentialStatus = "pending" | "active" | "suspended" | "expired";

export interface Credential {
  id: string;
  credentialId: string;
  credentialCode: string;
  qrPayload: string;
  status: CredentialStatus;
  market: Market;
  // Unset until payment is confirmed — a "pending" credential has neither yet.
  issuedAt?: string;
  expiresAt?: string;
}

export interface MerchantLocation {
  id: string;
  label: string;
  address?: string;
  city?: string;
  country: string;
  mapsUrl?: string;
}

export interface MerchantAccount {
  id: string;
  name: string;
  category: string;
  description?: string;
  logoUrl?: string;
  country: Market;
  contactEmail?: string;
  contactPhone?: string;
  locations: MerchantLocation[];
}

export type DiscountType = "percentage" | "fixed";

export interface MerchantOffer {
  id: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  code?: string;
  minimumPurchaseAmount?: number;
  terms?: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

export type OfferRedemptionStatus = "valid" | "expired" | "not_started";

export interface RedeemableOffer {
  id: string;
  title: string;
  discountType: DiscountType;
  discountValue: number;
  code: string;
  minimumPurchaseAmount?: number;
  validTo?: string;
  status: OfferRedemptionStatus;
}

export interface RedeemLookupResult {
  result: "valid" | "suspended" | "expired" | "invalid";
  holder: { name: string; photoUrl: string | null };
  credential: { id: string; status: CredentialStatus; expiresAt?: string };
  offers: RedeemableOffer[];
}

export interface Redemption {
  id: string;
  merchantName: string;
  locationLabel?: string;
  offerTitle: string;
  discountType: DiscountType;
  discountValue: number;
  amountRedeemed: number;
  redeemedAt: string;
}

export type PaymentStatus = "pending" | "confirmed" | "failed" | "refund-flagged";

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  providerRef?: string;
  status: PaymentStatus;
  createdAt: string;
}
