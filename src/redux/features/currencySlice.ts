import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CurrencyCode = "INR" | "USD";

export interface CurrencyState {
  currency: CurrencyCode;
  exchangeRate: number; // 1 USD = 83 INR
}

const getInitialCurrency = (): CurrencyCode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("app_currency");
    if (saved === "USD" || saved === "INR") {
      return saved;
    }
  }
  return "INR";
};

const initialState: CurrencyState = {
  currency: getInitialCurrency(),
  exchangeRate: 83,
};

export const currencySlice = createSlice({
  name: "currencySlice",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<CurrencyCode>) => {
      state.currency = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("app_currency", action.payload);
      }
    },
    toggleCurrency: (state) => {
      const next = state.currency === "INR" ? "USD" : "INR";
      state.currency = next;
      if (typeof window !== "undefined") {
        localStorage.setItem("app_currency", next);
      }
    },
  },
});

export const { setCurrency, toggleCurrency } = currencySlice.actions;
export default currencySlice.reducer;
