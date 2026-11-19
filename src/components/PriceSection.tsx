import { FC } from "react";
import useDiscount from "../hooks/useDiscount";
import { useCurrency } from "../hooks/useCurrency";

interface PriceSectionProps {
  price: number;
  discountPercentage?: number;
  size?: "sm" | "md" | "lg";
}

const PriceSection: FC<PriceSectionProps> = ({
  price,
  discountPercentage = 0,
  size = "md",
}) => {
  const result = useDiscount({ price, discount: discountPercentage });
  const { formatPrice } = useCurrency();
  const discount = parseFloat(discountPercentage.toString());

  const headingSizeClass =
    size === "lg"
      ? "text-2xl sm:text-3xl font-bold"
      : size === "sm"
      ? "text-base font-semibold"
      : "text-lg sm:text-xl font-bold";

  if (Math.floor(discount) === 0) {
    return (
      <h2 className={`${headingSizeClass} text-blue-600 dark:text-blue-400 tracking-tight`}>
        {formatPrice(price)}
      </h2>
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <h2 className={`${headingSizeClass} text-blue-600 dark:text-blue-400 tracking-tight`}>
        {formatPrice(result)}
      </h2>
      <span className="text-xs sm:text-sm line-through text-slate-400 dark:text-slate-500">
        {formatPrice(price)}
      </span>
      <span className="text-[11px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md">
        -{Math.round(discountPercentage)}%
      </span>
    </div>
  );
};

export default PriceSection;
