import { FC, useEffect, useMemo, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addToCart, emptyCart, setCartState } from "../redux/features/cartSlice";
import { addProducts } from "../redux/features/productSlice";
import CartRow from "./CartRow";
import CheckoutModal from "./CheckoutModal";
import { useCurrency } from "../hooks/useCurrency";
import { API_ENDPOINTS } from "../api";
import { Product } from "../models/Product";
import { FiAlertTriangle, FiPlus, FiTag } from "react-icons/fi";
import { BiWallet } from "react-icons/bi";
import toast from "react-hot-toast";

interface RecommendedAlternative {
  product: Product;
  comparedToItemTitle: string;
  category: string;
  savingsUSD: number;
}

const Cart: FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.cartReducer.cartOpen);
  const items = useAppSelector((state) => state.cartReducer.cartItems);
  const allProducts = useAppSelector(
    (state) => state.productReducer.allProducts
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { symbol, convertPrice, formatPrice } = useCurrency();

  // User-defined budget in active currency
  const [userBudgetInput, setUserBudgetInput] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("shopify_cart_budget") || "";
    }
    return "";
  });

  // Fetch full store catalog (limit=500) if empty to have every category's products available
  useEffect(() => {
    if (allProducts.length === 0) {
      fetch(`${API_ENDPOINTS.PRODUCTS}?limit=500`)
        .then((res) => res.json())
        .then((data) => {
          if (data.products) dispatch(addProducts(data.products));
        })
        .catch((err) => console.error("Failed to load products for cart alternatives", err));
    }
  }, [allProducts.length, dispatch]);

  const handleBudgetChange = (val: string) => {
    setUserBudgetInput(val);
    if (typeof window !== "undefined") {
      if (val) localStorage.setItem("shopify_cart_budget", val);
      else localStorage.removeItem("shopify_cart_budget");
    }
  };

  const calculateTotalUSD = (): number => {
    let total = 0;
    items.forEach((item) => {
      const discount = item.discountPercentage ?? 0;
      const qty = item.quantity ?? 1;
      const effectivePrice = item.price - (item.price * discount) / 100;
      total += effectivePrice * qty;
    });
    return total;
  };

  const totalUSD = calculateTotalUSD();
  const totalInActiveCurrency = convertPrice(totalUSD);
  const parsedBudget = parseFloat(userBudgetInput);
  const hasValidBudget = !isNaN(parsedBudget) && parsedBudget > 0;
  const isOverBudget = hasValidBudget && totalInActiveCurrency > parsedBudget;
  const excessAmount = isOverBudget ? totalInActiveCurrency - parsedBudget : 0;

  // STRICT SAME-CATEGORY LOWER-PRICED RECOMMENDATIONS:
  // For each item in the cart, identify products in the EXACT SAME CATEGORY that cost less
  const alternativeRecommendations = useMemo<RecommendedAlternative[]>(() => {
    if (!isOverBudget || allProducts.length === 0 || items.length === 0) {
      return [];
    }

    const cartIds = new Set(items.map((i) => i.id));
    const result: RecommendedAlternative[] = [];

    items.forEach((cartItem) => {
      const cartItemEffectivePrice =
        cartItem.price - (cartItem.price * (cartItem.discountPercentage ?? 0)) / 100;

      // Filter store catalog strictly by exact same category
      const sameCategoryLowerPriced = allProducts.filter((p) => {
        if (cartIds.has(p.id)) return false;
        // MUST BE THE EXACT SAME CATEGORY
        if (p.category !== cartItem.category) return false;

        const pEffectivePrice =
          p.price - (p.price * (p.discountPercentage ?? 0)) / 100;

        return pEffectivePrice < cartItemEffectivePrice;
      });

      // Sort by price ascending (cheapest alternative in that category first)
      sameCategoryLowerPriced.sort((a, b) => {
        const aP = a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
        const bP = b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
        return aP - bP;
      });

      sameCategoryLowerPriced.forEach((altProduct) => {
        const altPrice =
          altProduct.price - (altProduct.price * (altProduct.discountPercentage ?? 0)) / 100;
        const savings = cartItemEffectivePrice - altPrice;

        if (!result.some((r) => r.product.id === altProduct.id)) {
          result.push({
            product: altProduct,
            comparedToItemTitle: cartItem.title,
            category: cartItem.category,
            savingsUSD: savings,
          });
        }
      });
    });

    return result.slice(0, 3);
  }, [isOverBudget, allProducts, items]);

  const handleAddAlternative = (product: Product) => {
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        rating: product.rating,
        category: product.category,
        discountPercentage: product.discountPercentage,
      })
    );
    toast.success(`Added ${product.title} to cart`);
  };

  const handleOrderCompleted = () => {
    dispatch(emptyCart());
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="bg-black/60 backdrop-blur-xs w-full min-h-screen fixed left-0 top-0 z-40 overflow-y-auto flex justify-end transition-opacity">
        <div
          className="max-w-[480px] w-full min-h-full bg-white dark:bg-slate-800 p-5 sm:p-6 font-karla dark:text-white shadow-2xl flex flex-col justify-between"
          data-test="cart-container"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Your Cart</h3>
              <button
                type="button"
                onClick={() => dispatch(setCartState(false))}
                data-test="cart-close"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <RxCross1 className="text-xl" />
              </button>
            </div>

            {/* Set Budget Input */}
            {items.length > 0 && (
              <div
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs"
                data-test="cart-budget-section"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="cart-budget-input"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <BiWallet className="text-blue-600 text-sm" />
                    <span>Set Maximum Cart Budget</span>
                  </label>
                  {userBudgetInput && (
                    <button
                      type="button"
                      onClick={() => handleBudgetChange("")}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold text-sm">
                    {symbol}
                  </span>
                  <input
                    id="cart-budget-input"
                    type="number"
                    min="1"
                    step="1"
                    placeholder={`e.g. ${symbol === "₹" ? "10000" : "150"}`}
                    value={userBudgetInput}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    data-test="set-budget-input"
                  />
                </div>

                {hasValidBudget && !isOverBudget && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Within budget! ({symbol}{(parsedBudget - totalInActiveCurrency).toLocaleString("en-US", { maximumFractionDigits: 2 })} remaining)
                  </p>
                )}
              </div>
            )}

            {/* Warning Banner when budget is exceeded */}
            {isOverBudget && (
              <div
                className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3 shadow-xs animate-shake"
                data-test="budget-warning-banner"
              >
                <div className="flex items-start gap-2.5">
                  <FiAlertTriangle className="text-amber-600 dark:text-amber-400 text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-tight">
                      Budget Exceeded by {symbol}
                      {excessAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                      Your cart total is {symbol}
                      {totalInActiveCurrency.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}, surpassing your budget of {symbol}
                      {parsedBudget.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}.
                    </p>
                  </div>
                </div>

                {/* Strictly Same-Category Lower-Priced Recommendations */}
                {alternativeRecommendations.length > 0 && (
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
                      <span className="flex items-center gap-1.5">
                        <FiTag className="text-blue-600 text-xs" />
                        <span>Lower-Priced Same-Category Alternatives</span>
                      </span>
                    </div>

                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {alternativeRecommendations.map(({ product, comparedToItemTitle, category, savingsUSD }) => {
                        const discount = product.discountPercentage ?? 0;
                        const unitPrice =
                          product.price - (product.price * discount) / 100;

                        return (
                          <div
                            key={product.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="w-9 h-9 object-contain rounded bg-slate-50 dark:bg-slate-700 p-0.5 flex-shrink-0"
                                />
                                <div className="truncate">
                                  <p className="font-bold text-xs text-slate-800 dark:text-white truncate max-w-[170px]">
                                    {product.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                      {formatPrice(unitPrice)}
                                    </span>
                                    <span className="text-slate-400 text-[10px]">
                                      (Save {formatPrice(savingsUSD)})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddAlternative(product)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors flex-shrink-0 cursor-pointer active:scale-95"
                                title={`Add lower-priced ${category} item`}
                              >
                                <FiPlus className="text-xs" />
                                <span>Add</span>
                              </button>
                            </div>

                            <p className="text-[10px] text-slate-500 dark:text-slate-400 pl-1 border-t border-slate-100 dark:border-slate-700/60 pt-1">
                              Same category: <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">{category}</span> (vs {comparedToItemTitle})
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
              {items?.length > 0 ? (
                items.map((item) => <CartRow key={item.id} {...item} />)
              ) : (
                <div className="flex flex-col justify-center items-center py-12 px-4 text-center">
                  <img src="/emptyCart.jpg" alt="empty" className="w-36 rounded-xl mb-4 opacity-80" />
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Looks like you haven't added anything yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Footer */}
          {items?.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-base text-slate-700 dark:text-slate-300">
                    Total
                  </span>
                  {hasValidBudget && (
                    <p className="text-[11px] text-slate-400">
                      Budget: {symbol}{parsedBudget.toLocaleString("en-US")}
                    </p>
                  )}
                </div>
                <span className="font-extrabold text-2xl text-blue-600 dark:text-blue-400">
                  {formatPrice(totalUSD)}
                </span>
              </div>

              <button
                type="button"
                data-test="checkout-btn"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full text-center text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                CHECKOUT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Multi-step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        totalAmountUSD={totalUSD}
        onOrderCompleted={handleOrderCompleted}
      />
    </>
  );
};

export default Cart;
