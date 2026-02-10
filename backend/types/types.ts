import { HydratedDocument, Types } from "mongoose";
import { Request } from "express";

export type UserRole = "user" | "organizer" | "admin";
export type TicketStatus = "valid" | "used" | "cancelled";
export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled";
export type PaymentStatus = "success" | "refunded";
export type PayoutStatus = "pending" | "paid";
export type AnalyticsEventType = "view" | "click" | "checkin";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  profileImage?: string;
  email: string;
  password: string;
  role: UserRole;
  isPremium: boolean;
  bookmarks: Types.ObjectId[];
  interests: string[];
  location: {
    type: "Point";
    coordinates: number[];
  };
  createdAt: Date;
  refreshToken?: string;
  stripeCustomerId?: string;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export type IUserDocument = HydratedDocument<IUser, IUserMethods>;

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

export interface IEventLocation {
  city: string;
  lat: number;
  lng: number;
}

export interface IEvent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  location: IEventLocation;
  startDate: Date;
  endDate: Date;
  coverImage: string;
  price: number;
  capacity: number;
  organizerId: Types.ObjectId; // User._id
  isPublished: boolean;
  createdAt: Date;
}

export interface ITicket {
  _id: Types.ObjectId;
  eventId: Types.ObjectId; // Event._id
  userId: Types.ObjectId; // User._id
  ticketCode: string; // UUID
  qrPayload: string; // signed payload
  status: TicketStatus;
  checkedInAt?: Date;
  createdAt: Date;
}

export interface ICheckIn {
  _id: Types.ObjectId;
  eventId: Types.ObjectId; // Event._id
  ticketId: Types.ObjectId; // Ticket._id
  scannedBy: Types.ObjectId; // Organizer User._id
  scannedAt: Date;
}

export interface IPaymentTransaction {
  _id: Types.ObjectId;
  stripePaymentIntentId: string;
  eventId: Types.ObjectId; // Event._id
  organizerId: Types.ObjectId; // User._id
  userId: Types.ObjectId; // Buyer User._id
  amount: number; // total paid
  platformFee: number;
  organizerShare: number;
  status: PaymentStatus;
  createdAt: Date;
}

export interface ISubscription {
  _id: Types.ObjectId;
  userId: Types.ObjectId; // User._id
  plan: SubscriptionPlan;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

export interface IPayout {
  _id: Types.ObjectId;
  organizerId: Types.ObjectId; // User._id
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: PayoutStatus;
  paidAt?: Date;
}

export interface IAnalyticsEvent {
  _id: Types.ObjectId;
  eventId: Types.ObjectId; // Event._id
  type: AnalyticsEventType;
  userId?: Types.ObjectId; // optional (anonymous views)
  createdAt: Date;
}
