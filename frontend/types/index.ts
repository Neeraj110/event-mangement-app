export type UserRole = "user" | "organizer" | "admin";
export type TicketStatus = "valid" | "used" | "cancelled";
export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";
export type PayoutStatus = "pending" | "paid";
export type AnalyticsEventType = "view" | "click" | "checkin";

export interface IEventLocation {
  city: string;
  lat: number;
  lng: number;
}

export interface User {
  _id: string;
  name: string;
  profileImage?: string;
  email: string;
  role: UserRole;
  isPremium: boolean;
  bookmarks: string[]; // Event IDs
  interests: string[];
  location: {
    type: "Point";
    coordinates: number[];
  };
  createdAt: string;
  refreshToken?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: IEventLocation;
  startDate: string;
  endDate: string;
  coverImage: string;
  price: number;
  capacity: number;
  organizerId: string; // User ID
  isPublished: boolean;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  eventId: string;
  userId: string;
  ticketCode: string;
  qrPayload: string;
  status: TicketStatus;
  checkedInAt?: string;
  createdAt: string;
}

export interface CheckIn {
  _id: string;
  eventId: string;
  ticketId: string;
  scannedBy: string;
  scannedAt: string;
}

export interface PaymentTransaction {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  eventId: string;
  organizerId: string;
  userId: string;
  amount: number;
  platformFee: number;
  organizerShare: number;
  status: PaymentStatus;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
}

export interface Payout {
  _id: string;
  organizerId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  status: PayoutStatus;
  paidAt?: string;
}

export interface AnalyticsEvent {
  _id: string;
  eventId: string;
  type: AnalyticsEventType;
  userId?: string;
  createdAt: string;
}

// API Response Types
export interface LoginResponse {
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface VerifyOTPResponse {
  message: string;
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface OTPResponse {
  message: string;
}

export interface EventStatsResponse {
  totalTicketsSold: number;
  totalRevenue: number;
  checkInCount: number;
  remainingCapacity: number;
}

export interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentResponse {
  message: string;
  transactionId: string;
  ticketCount: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, any>;
}
