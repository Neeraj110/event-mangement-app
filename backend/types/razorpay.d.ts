declare module "razorpay" {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface OrderCreateParams {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
    partial_payment?: boolean;
  }

  interface Order {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    notes: Record<string, string>;
    created_at: number;
  }

  interface Orders {
    create(params: OrderCreateParams): Promise<Order>;
    fetch(orderId: string): Promise<Order>;
    fetchAll(params?: Record<string, any>): Promise<{ items: Order[] }>;
  }

  interface Payments {
    fetch(paymentId: string): Promise<any>;
    capture(paymentId: string, amount: number, currency: string): Promise<any>;
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    orders: Orders;
    payments: Payments;
  }

  export = Razorpay;
}
