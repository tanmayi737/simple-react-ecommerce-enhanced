import { CartItem } from "../models/CartItem";
import { DeliveryAddress, Order } from "../models/Order";

const ADDRESSES_STORAGE_KEY = "shopify_delivery_addresses";
const ORDERS_STORAGE_KEY = "shopify_orders";
export const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours in ms

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: "addr-default-1",
    fullName: "Terry Medhurst",
    phone: "+1 202-555-0143",
    street: "1745 T Street NW, Apt 4B",
    city: "Washington",
    state: "DC",
    postalCode: "20009",
    label: "Home",
    isDefault: true,
  },
  {
    id: "addr-default-2",
    fullName: "Terry Medhurst",
    phone: "+1 202-555-0188",
    street: "1200 Pennsylvania Ave NW, Suite 300",
    city: "Washington",
    state: "DC",
    postalCode: "20004",
    label: "Work",
    isDefault: false,
  },
];

export const getStoredAddresses = (): DeliveryAddress[] => {
  if (typeof window === "undefined") return DEFAULT_ADDRESSES;
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(DEFAULT_ADDRESSES));
      return DEFAULT_ADDRESSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ADDRESSES;
  } catch (error) {
    console.error("Failed to load addresses from localStorage", error);
    return DEFAULT_ADDRESSES;
  }
};

export const saveStoredAddress = (
  newAddressData: Omit<DeliveryAddress, "id">
): DeliveryAddress => {
  const current = getStoredAddresses();
  const newAddress: DeliveryAddress = {
    ...newAddressData,
    id: `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };

  const updated = [newAddress, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
  }
  return newAddress;
};

export const getStoredOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load orders from localStorage", error);
    return [];
  }
};

export const saveOrder = (orderData: {
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  totalAmountUSD: number;
  paymentMethod: string;
}): Order => {
  const currentOrders = getStoredOrders();
  const timestamp = Date.now();

  const newOrder: Order = {
    id: `ORD-${timestamp.toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date(timestamp).toISOString(),
    timestamp,
    items: orderData.items,
    deliveryAddress: orderData.deliveryAddress,
    totalAmountUSD: orderData.totalAmountUSD,
    paymentMethod: orderData.paymentMethod || "Cash on Delivery",
    status: "Confirmed",
  };

  const updatedOrders = [newOrder, ...currentOrders];
  if (typeof window !== "undefined") {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
  }
  return newOrder;
};

export const cancelOrder = (orderId: string): { success: boolean; message: string } => {
  const currentOrders = getStoredOrders();
  const index = currentOrders.findIndex((o) => o.id === orderId);

  if (index === -1) {
    return { success: false, message: "Order not found." };
  }

  const order = currentOrders[index];

  if (order.status === "Cancelled") {
    return { success: false, message: "Order has already been cancelled." };
  }

  const elapsed = Date.now() - order.timestamp;
  if (elapsed > CANCELLATION_WINDOW_MS) {
    return {
      success: false,
      message: "Order cannot be cancelled. The 2-hour cancellation window has passed.",
    };
  }

  const updatedOrder: Order = {
    ...order,
    status: "Cancelled",
    cancelledAt: new Date().toISOString(),
  };

  currentOrders[index] = updatedOrder;
  if (typeof window !== "undefined") {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(currentOrders));
  }

  return { success: true, message: `Order #${orderId} was successfully cancelled.` };
};

export const isOrderCancelable = (order: Order): boolean => {
  if (order.status === "Cancelled") return false;
  return Date.now() - order.timestamp <= CANCELLATION_WINDOW_MS;
};

export const getRemainingCancelTime = (order: Order): string => {
  if (order.status === "Cancelled") return "Cancelled";
  const remainingMs = CANCELLATION_WINDOW_MS - (Date.now() - order.timestamp);
  if (remainingMs <= 0) return "Expired (2h passed)";

  const totalMinutes = Math.floor(remainingMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};
