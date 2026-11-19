import { CartItem } from "./CartItem";

export interface DeliveryAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  label?: string; // e.g. "Home", "Work", "Other"
  isDefault?: boolean;
}

export type OrderStatus =
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface Order {
  id: string;
  createdAt: string; // ISO date string
  timestamp: number; // Milliseconds since epoch
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  totalAmountUSD: number;
  paymentMethod: string;
  status: OrderStatus;
  cancelledAt?: string;
}
