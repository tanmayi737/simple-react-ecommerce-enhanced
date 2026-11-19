import { FC, useRef } from "react";
import { Product } from "../models/Product";

interface Props {
  products: Product[];
  onChange: (sorted: Product[]) => void;
  className?: string;
}

const SortProducts: FC<Props> = ({ products, onChange, className = "" }) => {
  const sortRef = useRef<HTMLSelectElement>(null);

  const sortProducts = (sortValue: string) => {
    let sorted: Product[] = [...products];

    if (sortValue === "asc") {
      sorted = sorted.sort((a, b) => {
        const aPrice =
          a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
        const bPrice =
          b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
        return aPrice - bPrice;
      });
    } else if (sortValue === "desc") {
      sorted = sorted.sort((a, b) => {
        const aPrice =
          a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
        const bPrice =
          b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
        return bPrice - aPrice;
      });
    } else {
      sorted = sorted.sort((a, b) => a.id - b.id);
    }

    onChange(sorted);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        ref={sortRef}
        className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-xl px-3.5 py-2 pr-8 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
        onChange={(e) => sortProducts(e.target.value)}
        aria-label="Sort products"
      >
        <option value="default">Sort: Default</option>
        <option value="asc">Price: Low to High</option>
        <option value="desc">Price: High to Low</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};

export default SortProducts;
