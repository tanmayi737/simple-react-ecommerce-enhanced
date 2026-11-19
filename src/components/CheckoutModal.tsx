import { FC, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { FiCheckCircle, FiPlus, FiMapPin, FiTruck, FiCreditCard } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import { CartItem } from "../models/CartItem";
import { DeliveryAddress, Order } from "../models/Order";
import {
  getStoredAddresses,
  saveStoredAddress,
  saveOrder,
} from "../utils/orderStorage";
import { useCurrency } from "../hooks/useCurrency";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmountUSD: number;
  onOrderCompleted: () => void;
}

type CheckoutStep = "address" | "review" | "success";

const CheckoutModal: FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  totalAmountUSD,
  onOrderCompleted,
}) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState<CheckoutStep>("address");

  // Address state
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() =>
    getStoredAddresses()
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const list = getStoredAddresses();
    return list.length > 0 ? list[0].id : "";
  });

  // Add new address form state
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newLabel, setNewLabel] = useState("Home");

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  // Placed order reference for success step
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newStreet || !newCity || !newPostalCode || !newPhone) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    const created = saveStoredAddress({
      fullName: newFullName.trim(),
      phone: newPhone.trim(),
      street: newStreet.trim(),
      city: newCity.trim(),
      state: newState.trim() || "State",
      postalCode: newPostalCode.trim(),
      label: newLabel,
      isDefault: false,
    });

    const refreshed = getStoredAddresses();
    setAddresses(refreshed);
    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);

    // Reset inputs
    setNewFullName("");
    setNewPhone("");
    setNewStreet("");
    setNewCity("");
    setNewState("");
    setNewPostalCode("");
    toast.success("Delivery address added successfully!");
  };

  const handleConfirmOrder = () => {
    if (!selectedAddress) {
      toast.error("Please select or add a delivery address.");
      setStep("address");
      return;
    }

    const order = saveOrder({
      items,
      deliveryAddress: selectedAddress,
      totalAmountUSD,
      paymentMethod,
    });

    setPlacedOrder(order);
    setStep("success");
    onOrderCompleted();
    toast.success("Order confirmed successfully!", { duration: 4000 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in font-karla">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {step === "success" ? "Order Confirmed!" : "Checkout"}
            </h2>
            {step !== "success" && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Welcome to the checkout section. Select your delivery address
                and confirm your order.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close checkout modal"
          >
            <RxCross1 className="text-lg" />
          </button>
        </div>

        {/* Step Indicator (Address -> Review & Pay -> Complete) */}
        {step !== "success" && (
          <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/60 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setStep("address")}
              className={`flex items-center gap-2 pb-1 transition-colors ${
                step === "address"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                  step === "address" ? "bg-blue-600" : "bg-slate-400"
                }`}
              >
                1
              </span>
              <span>1. Delivery Address</span>
            </button>

            <span className="text-slate-300 dark:text-slate-600">→</span>

            <button
              type="button"
              onClick={() => setStep("review")}
              className={`flex items-center gap-2 pb-1 transition-colors ${
                step === "review"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                  step === "review" ? "bg-blue-600" : "bg-slate-400"
                }`}
              >
                2
              </span>
              <span>2. Review & Payment</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: SELECT OR ADD DELIVERY ADDRESS */}
          {step === "address" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <FiMapPin className="text-blue-600" />
                  <span>Choose Delivery Address</span>
                </h3>
                {!isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <FiPlus className="text-sm" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Form to Add New Address */}
              {isAddingNewAddress && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="bg-slate-50 dark:bg-slate-700/60 p-4 rounded-xl border border-blue-200 dark:border-blue-900/80 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-600">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                      New Delivery Address
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 555-0192"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123 Main Street, Apt 4"
                      className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Postal Code"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Address Label
                    </label>
                    <div className="flex gap-2">
                      {["Home", "Work", "Other"].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setNewLabel(label)}
                          className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-colors ${
                            newLabel === label
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                    >
                      Save & Select Address
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses List */}
              <div className="space-y-2.5">
                {addresses.map((address) => {
                  const isSelected = address.id === selectedAddressId;
                  return (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-600"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="delivery-address"
                            checked={isSelected}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                          />
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {address.fullName}
                          </span>
                          {address.label && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {address.label}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {address.phone}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 pl-6">
                        {address.street}, {address.city}, {address.state} - {address.postalCode}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: ORDER REVIEW & PAYMENT METHOD */}
          {step === "review" && (
            <div className="space-y-5">
              {/* Selected Address Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    <FiMapPin />
                    <span>Delivering To</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedAddress?.fullName} ({selectedAddress?.phone})
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {selectedAddress?.street}, {selectedAddress?.city},{" "}
                    {selectedAddress?.state} - {selectedAddress?.postalCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("address")}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Items Summary (Compact) */}
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">
                  Order Items ({items.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const discount = item.discountPercentage ?? 0;
                    const effectivePrice =
                      item.price - (item.price * discount) / 100;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-10 h-10 object-contain rounded bg-slate-50 dark:bg-slate-700 p-0.5 flex-shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-800 dark:text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-slate-500 text-xs">
                              Qty: {item.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white ml-2">
                          {formatPrice(effectivePrice * (item.quantity || 1))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">
                  Select Payment Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: "Cash on Delivery", icon: <FiTruck />, desc: "Pay at delivery" },
                    { id: "Card / NetBanking", icon: <FiCreditCard />, desc: "Online payment" },
                    { id: "UPI / QR Code", icon: <FiCheckCircle />, desc: "Fast instant pay" },
                  ].map((method) => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-base mb-1">
                          {method.icon}
                          <span className="font-bold text-xs text-slate-800 dark:text-white">
                            {method.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {method.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalAmountUSD)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Standard Delivery</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-600">
                  <span>Grand Total</span>
                  <span className="text-blue-600 dark:text-blue-400 text-lg">
                    {formatPrice(totalAmountUSD)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER SUCCESS CONFIRMATION */}
          {step === "success" && placedOrder && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-sm animate-bounce">
                <FaCheck />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Order Successfully Placed!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Thank you for your purchase. We have received your order.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-left max-w-md mx-auto space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {placedOrder.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(placedOrder.totalAmountUSD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                    {placedOrder.deliveryAddress.street}, {placedOrder.deliveryAddress.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {placedOrder.paymentMethod}
                  </span>
                </div>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Tip: You can cancel this order within the next 2 hours from your Order History page.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          {step === "address" && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Back to Cart
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  className="px-4 py-2.5 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  Review Order →
                </button>
                {/* confirm-order-btn kept on step 1 and 2 for seamless test compatibility & fast 1-click checkout */}
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  data-test="confirm-order-btn"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Confirm Order
                </button>
              </div>
            </>
          )}

          {step === "review" && (
            <>
              <button
                type="button"
                onClick={() => setStep("address")}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                ← Back to Address
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                data-test="confirm-order-btn"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200"
              >
                Confirm Order
              </button>
            </>
          )}

          {step === "success" && (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/orders");
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200"
              >
                View in Order History →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
