import { FC, useMemo } from "react";
import { useCurrency } from "../hooks/useCurrency";
import { BiSliderAlt } from "react-icons/bi";
import { FiRotateCcw } from "react-icons/fi";

interface PriceRangeSliderProps {
  maxBudgetUSD: number;
  onBudgetChange: (maxBudgetUSD: number) => void;
  minPriceUSD?: number;
  maxPriceUSD?: number;
  totalProductsCount: number;
  filteredProductsCount: number;
  className?: string;
}

const PriceRangeSlider: FC<PriceRangeSliderProps> = ({
  maxBudgetUSD,
  onBudgetChange,
  minPriceUSD = 0,
  maxPriceUSD = 2000,
  totalProductsCount,
  filteredProductsCount,
  className = "",
}) => {
  const { currency, symbol, convertPrice, convertToUSD } = useCurrency();

  // Active currency scale bounds
  const currentMin = Math.floor(convertPrice(minPriceUSD));
  const currentMax = Math.ceil(convertPrice(maxPriceUSD));
  const currentVal = Math.min(
    Math.ceil(convertPrice(maxBudgetUSD)),
    currentMax
  );

  const step = currency === "INR" ? 500 : 10;

  // Calculate percentage for progress fill
  const percentage = useMemo(() => {
    if (currentMax === 0) return 100;
    return Math.min(100, Math.max(0, (currentVal / currentMax) * 100));
  }, [currentVal, currentMax]);

  const handleSliderChange = (valInActiveCurrency: number) => {
    const valInUSD = convertToUSD(valInActiveCurrency);
    onBudgetChange(valInUSD);
  };

  const handleReset = () => {
    onBudgetChange(maxPriceUSD);
  };

  const isFiltered = currentVal < currentMax;

  // Format budget label with active currency
  const formattedBudget =
    currency === "INR"
      ? `₹${currentVal.toLocaleString("en-IN")}`
      : `$${currentVal.toLocaleString("en-US")}`;

  const formattedMax =
    currency === "INR"
      ? `₹${currentMax.toLocaleString("en-IN")}`
      : `$${currentMax.toLocaleString("en-US")}`;

  const formattedMin = `${symbol}0`;

  // Quick preset fractions
  const presets = [
    { label: "All", fraction: 1.0 },
    { label: "75%", fraction: 0.75 },
    { label: "50%", fraction: 0.5 },
    { label: "25%", fraction: 0.25 },
  ];

  return (
    <div
      className={`bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
      data-test="price-range-slider-container"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <BiSliderAlt className="text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white leading-tight">
              Filter by Budget
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {filteredProductsCount}
              </span>{" "}
              of {totalProductsCount} products
            </p>
          </div>
        </div>

        {/* Current Budget Value Badge & Reset */}
        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              title="Reset to max budget"
            >
              <FiRotateCcw className="text-xs" />
              <span>Reset</span>
            </button>
          )}

          <div className="inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Max Budget:
            </span>
            <span
              className="font-extrabold text-base sm:text-lg text-blue-600 dark:text-blue-400"
              data-test="price-slider-value"
            >
              {formattedBudget}
            </span>
          </div>
        </div>
      </div>

      {/* Slider / Scrollbar Track */}
      <div className="relative my-3">
        <div className="relative flex items-center">
          {/* Custom Track Background with active fill */}
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-75 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Native HTML Range Input styled over track */}
          <input
            type="range"
            min={currentMin}
            max={currentMax}
            step={step}
            value={currentVal}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="absolute w-full h-2.5 opacity-0 cursor-pointer inset-0 z-10"
            aria-label="Maximum budget range slider"
            data-test="price-range-slider"
          />

          {/* Custom Styled Slider Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md pointer-events-none transform -translate-x-1/2 transition-transform duration-75 flex items-center justify-center hover:scale-110"
            style={{ left: `${percentage}%` }}
          >
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
          </div>
        </div>

        {/* Min / Max Labels */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1.5 px-0.5">
          <span>{formattedMin}</span>
          <span>Up to {formattedMax}</span>
        </div>
      </div>

      {/* Quick Budget Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
          Quick filters:
        </span>
        {presets.map((preset) => {
          const presetValueUSD = maxPriceUSD * preset.fraction;
          const presetValueActive = Math.ceil(convertPrice(presetValueUSD));
          const isActive =
            Math.abs(currentVal - presetValueActive) < step * 1.5;

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onBudgetChange(presetValueUSD)}
              className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs font-semibold"
                  : "bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {preset.fraction === 1.0
                ? "All Budgets"
                : `≤ ${
                    currency === "INR"
                      ? `₹${presetValueActive.toLocaleString("en-IN")}`
                      : `$${presetValueActive.toLocaleString("en-US")}`
                  }`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PriceRangeSlider;
