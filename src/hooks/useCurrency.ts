import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  CurrencyCode,
  setCurrency,
  toggleCurrency,
} from "../redux/features/currencySlice";

export const EXCHANGE_RATE = 83; // 1 USD = 83 INR

export interface FormatPriceOptions {
  showDecimals?: boolean;
}

export const useCurrency = () => {
  const dispatch = useAppDispatch();
  const currency = useAppSelector(
    (state) => state.currencyReducer.currency
  ) as CurrencyCode;
  const exchangeRate = useAppSelector(
    (state) => state.currencyReducer.exchangeRate
  ) || EXCHANGE_RATE;

  const symbol = currency === "INR" ? "₹" : "$";

  /**
   * Converts a base price (assumed to be in USD from API) into the currently active currency.
   */
  const convertPrice = (priceInUSD: number): number => {
    if (currency === "INR") {
      return priceInUSD * exchangeRate;
    }
    return priceInUSD;
  };

  /**
   * Converts a price from the currently active currency back to USD (useful for filtering/comparing).
   */
  const convertToUSD = (priceInCurrent: number): number => {
    if (currency === "INR") {
      return priceInCurrent / exchangeRate;
    }
    return priceInCurrent;
  };

  /**
   * Formats a USD price with the active currency symbol and localization.
   */
  const formatPrice = (
    priceInUSD: number,
    options?: FormatPriceOptions
  ): string => {
    const converted = convertPrice(priceInUSD);
    const hasDecimals = options?.showDecimals ?? (currency === "USD" || converted % 1 !== 0);

    const formattedNumber = converted.toLocaleString(
      currency === "INR" ? "en-IN" : "en-US",
      {
        minimumFractionDigits: hasDecimals ? 2 : 0,
        maximumFractionDigits: hasDecimals ? 2 : 0,
      }
    );

    return `${symbol}${formattedNumber}`;
  };

  return {
    currency,
    symbol,
    exchangeRate,
    convertPrice,
    convertToUSD,
    formatPrice,
    setCurrency: (c: CurrencyCode) => dispatch(setCurrency(c)),
    toggleCurrency: () => dispatch(toggleCurrency()),
  };
};

export default useCurrency;
