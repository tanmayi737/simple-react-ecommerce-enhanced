import { FC, useCallback, useEffect, useState } from "react";
import { Order } from "../models/Order";
import {
  getStoredOrders,
  cancelOrder,
  isOrderCancelable,
  getRemainingCancelTime,
} from "../utils/orderStorage";
import { useCurrency } from "../hooks/useCurrency";
import { FiPackage, FiClock, FiMapPin, FiCreditCard, FiXCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface OrderHistoryProps {
  className?: string;
  limit?: number;
}

const OrderHistory: FC<OrderHistoryProps> = ({ className = "", limit }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { formatPrice } = useCurrency();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    const list = getStoredOrders();
    setOrders(limit ? list.slice(0, limit) : list);
  }, [limit]);

  useEffect(() => {
    loadOrders();

    // Refresh every 30 seconds to update live cancel window timers
    const timer = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(timer);
  }, [loadOrders]);

  const handleCancelClick = (order: Order) => {
    if (!isOrderCancelable(order)) {
      toast.error("This order cannot be cancelled. The 2-hour window has expired.");
      return;
    }
    setCancellingOrderId(order.id);
  };

  const confirmCancellation = (orderId: string) => {
    const res = cancelOrder(orderId);
    if (res.success) {
      toast.success(res.message);
      loadOrders();
    } else {
      toast.error(res.message);
    }
    setCancellingOrderId(null);
  };

  if (orders.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-4 shadow-sm ${className}`}
        data-test="order-history-empty"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-3xl">
          <FiPackage />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            No Orders Placed Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You haven't placed any orders yet. Discover our latest items and fill
            your cart!
          </p>
        </div>
        <Link
          to="/products"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-test="order-history-section">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FiPackage className="text-blue-600 dark:text-blue-400" />
            <span>Order History / Recently Purchased</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your purchases and track order delivery
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const cancelable = isOrderCancelable(order);
          const remainingTime = getRemainingCancelTime(order);
          const isCancelled = order.status === "Cancelled";
          const formattedDate = new Date(order.timestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          });

          return (
            <div
              key={order.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                isCancelled
                  ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20"
                  : "border-slate-200/80 dark:border-slate-700/80"
              }`}
              data-test="order-card"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      #{order.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Placed on {formattedDate}
                  </p>
                </div>

                {/* Cancel Order Action Button */}
                <div className="flex items-center gap-2">
                  {!isCancelled && (
                    <div className="flex flex-col items-end">
                      <button
                        type="button"
                        onClick={() => handleCancelClick(order)}
                        disabled={!cancelable}
                        data-test="cancel-order-btn"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          cancelable
                            ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-xs cursor-pointer active:scale-95"
                            : "bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60"
                        }`}
                        title={
                          cancelable
                            ? `Cancel within 2h window (${remainingTime})`
                            : "Order can only be cancelled within 2 hours of placement"
                        }
                      >
                        <FiXCircle className="text-sm" />
                        <span>Cancel Order</span>
                      </button>

                      <span
                        className={`text-[10px] mt-0.5 flex items-center gap-1 font-medium ${
                          cancelable
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        <FiClock className="text-[10px]" />
                        <span>
                          {cancelable
                            ? `${remainingTime} to cancel`
                            : "2h cancel window expired"}
                        </span>
                      </span>
                    </div>
                  )}

                  {isCancelled && (
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>

              {/* Order Content */}
              <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Items preview */}
                <div className="md:col-span-2 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Purchased Items ({order.items.length})
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {order.items.map((item) => {
                      const discount = item.discountPercentage ?? 0;
                      const unitPrice =
                        item.price - (item.price * discount) / 100;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs sm:text-sm p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/40"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-9 h-9 object-contain rounded bg-white dark:bg-slate-800 p-0.5 flex-shrink-0"
                            />
                            <span className="font-semibold text-slate-800 dark:text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-slate-500 text-xs flex-shrink-0">
                              × {item.quantity || 1}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white ml-2 flex-shrink-0">
                            {formatPrice(unitPrice * (item.quantity || 1))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping & Payment summary */}
                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <FiMapPin className="text-blue-600" />
                      <span>Delivery Address:</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
                      {order.deliveryAddress.fullName}
                      <br />
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      <br />
                      {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <FiCreditCard className="text-blue-600" />
                      <span>Payment Method:</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Footer Total */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Total Amount Paid
                </span>
                <span className="font-extrabold text-lg text-blue-600 dark:text-blue-400">
                  {formatPrice(order.totalAmountUSD)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-karla">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto">
              <FiXCircle />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Cancel Order #{cancellingOrderId}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to cancel this order? This action is valid
                because you placed the order within the 2-hour cancellation
                window.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={() => confirmCancellation(cancellingOrderId)}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-sm transition-colors"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
