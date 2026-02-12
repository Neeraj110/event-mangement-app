import { create } from "zustand";

export interface Transaction {
  id: string;
  eventName: string;
  eventId: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: "success" | "pending" | "refunded";
  invoiceId?: string;
}

export interface PurchaseSubscription {
  id: string;
  name: string;
  status: "active" | "cancelled";
  renewalDate: string;
}

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "paypal";
  last4: string;
  expiryDate: string;
  default: boolean;
}

export interface BillingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PurchasesState {
  transactions: Transaction[];
  subscriptions: PurchaseSubscription[];
  paymentMethods: PaymentMethod[];
  billingAddress: BillingAddress;
  totalSpent: number;
  activePassesCount: number;
  pendingInvoices: number;
  taxSavings: number;
  isLoading: boolean;
}

interface PurchasesActions {
  addTransaction: (transaction: Transaction) => void;
  updateBillingAddress: (address: BillingAddress) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  setDefaultPaymentMethod: (id: string) => void;
}

const mockTransactions: Transaction[] = [
  {
    id: "txn-001",
    eventName: "Tech Summit 2024 - Platinum Pass",
    eventId: "event-001",
    date: "Oct 12, 2023",
    amount: 1299,
    paymentMethod: "Visa •••• 1234",
    status: "success",
  },
  {
    id: "txn-002",
    eventName: "Design Workshop: AI & UX",
    eventId: "event-002",
    date: "Sep 28, 2023",
    amount: 150,
    paymentMethod: "Mastercard •••• 5678",
    status: "success",
  },
  {
    id: "txn-003",
    eventName: "Global AI Expo (Reserved)",
    eventId: "event-003",
    date: "Sep 15, 2023",
    amount: 450,
    paymentMethod: "PayPal Wallet",
    status: "refunded",
  },
  {
    id: "txn-004",
    eventName: "Marketing Gala Dinner",
    eventId: "event-004",
    date: "Aug 20, 2023",
    amount: 85,
    paymentMethod: "Visa •••• 1234",
    status: "success",
  },
  {
    id: "txn-005",
    eventName: "Cloud Infrastructure Day",
    eventId: "event-005",
    date: "Aug 10, 2023",
    amount: 299,
    paymentMethod: "Visa •••• 1234",
    status: "success",
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm-001",
    type: "visa",
    last4: "1234",
    expiryDate: "12/26",
    default: true,
  },
  {
    id: "pm-002",
    type: "mastercard",
    last4: "5678",
    expiryDate: "08/25",
    default: false,
  },
];

export const usePurchasesStore = create<PurchasesState & PurchasesActions>(
  (set) => ({
    transactions: mockTransactions,
    subscriptions: [
      {
        id: "sub-001",
        name: "VIP Annual Pass",
        status: "active",
        renewalDate: "12/26",
      },
      {
        id: "sub-002",
        name: "Festival Season Pass",
        status: "active",
        renewalDate: "09/26",
      },
      {
        id: "sub-003",
        name: "Early Bird Bundle",
        status: "active",
        renewalDate: "06/26",
      },
    ],
    paymentMethods: mockPaymentMethods,
    billingAddress: {
      name: "Alex Johnson",
      street: "123 Innovation Drive, Suite 400",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "United States",
    },
    totalSpent: 4822.5,
    activePassesCount: 12,
    pendingInvoices: 2,
    taxSavings: 342,
    isLoading: false,

    addTransaction: (transaction) =>
      set((state) => ({
        transactions: [transaction, ...state.transactions],
        totalSpent:
          transaction.status === "success"
            ? state.totalSpent + transaction.amount
            : state.totalSpent,
      })),

    updateBillingAddress: (billingAddress) => set({ billingAddress }),

    addPaymentMethod: (method) =>
      set((state) => ({
        paymentMethods: [...state.paymentMethods, method],
      })),

    setDefaultPaymentMethod: (id) =>
      set((state) => ({
        paymentMethods: state.paymentMethods.map((pm) => ({
          ...pm,
          default: pm.id === id,
        })),
      })),
  }),
);
