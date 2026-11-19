import { FC } from "react";
import { useCurrency } from "../hooks/useCurrency";

interface CurrencyToggleProps {
  className?: string;
  showRateBadge?: boolean;
}

const CurrencyToggle: FC<CurrencyToggleProps> = ({
  className = "",
  showRateBadge = false,
}) => {
  const { currency, setCurrency, exchangeRate } = useCurrency();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner"
        role="group"
        aria-label="Currency selection"
      >
        <button
          type="button"
          onClick={() => setCurrency("INR")}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
            currency === "INR"
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          data-test="currency-toggle-inr"
          title={`Switch to Indian Rupee (1 USD = ₹${exchangeRate})`}
        >
          <span className="font-bold">₹</span>
          <span>INR</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrency("USD")}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${
            currency === "USD"
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
          data-test="currency-toggle-usd"
          title={`Switch to US Dollar`}
        >
          <span className="font-bold">$</span>
          <span>USD</span>
        </button>
      </div>

      {showRateBadge && (
        <span className="hidden xl:inline-block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          1$ = ₹{exchangeRate}
        </span>
      )}
    </div>
  );
};

export default CurrencyToggle;
