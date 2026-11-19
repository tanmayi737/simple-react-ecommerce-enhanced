import { FC, useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { addProducts } from "../redux/features/productSlice";
import { updateLoading } from "../redux/features/homeSlice";
import SortProducts from "../components/SortProducts";
import PaginatedProducts from "../components/PaginatedProducts";
import PriceRangeSlider from "../components/PriceRangeSlider";
import { API_ENDPOINTS } from "../api";

const AllProducts: FC = () => {
  const dispatch = useAppDispatch();
  const allProducts = useAppSelector(
    (state) => state.productReducer.allProducts
  );
  const isLoading = useAppSelector((state) => state.homeReducer.isLoading);

  // Compute maximum price among all products (in USD)
  const calculatedMaxPriceUSD = useMemo(() => {
    if (allProducts.length === 0) return 2000;
    const maxVal = Math.max(...allProducts.map((p) => p.price));
    return Math.ceil(maxVal / 50) * 50;
  }, [allProducts]);

  const [maxBudgetUSD, setMaxBudgetUSD] = useState<number>(2000);
  const [currentSort, setCurrentSort] = useState<string>("default");

  useEffect(() => {
    const fetchProducts = () => {
      dispatch(updateLoading(true));
      fetch(`${API_ENDPOINTS.PRODUCTS}?limit=500`)
        .then((res) => res.json())
        .then(({ products }) => {
          dispatch(addProducts(products));
          dispatch(updateLoading(false));
        });
    };

    if (allProducts.length === 0) fetchProducts();
  }, [allProducts, dispatch]);

  // Sync initial max budget once products load
  useEffect(() => {
    if (calculatedMaxPriceUSD > 0 && maxBudgetUSD === 2000) {
      setMaxBudgetUSD(calculatedMaxPriceUSD);
    }
  }, [calculatedMaxPriceUSD, maxBudgetUSD]);

  // Real-time filtering based on maximum budget (effective discounted price)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const discount = product.discountPercentage ?? 0;
      const effectivePriceUSD =
        product.price - (product.price * discount) / 100;
      return effectivePriceUSD <= maxBudgetUSD;
    });
  }, [allProducts, maxBudgetUSD]);

  // Sorted list based on active sort
  const sortedAndFilteredProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (currentSort === "asc") {
      return sorted.sort((a, b) => {
        const aPrice = a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
        const bPrice = b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
        return aPrice - bPrice;
      });
    } else if (currentSort === "desc") {
      return sorted.sort((a, b) => {
        const aPrice = a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
        const bPrice = b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
        return bPrice - aPrice;
      });
    }
    return sorted;
  }, [filteredProducts, currentSort]);

  return (
    <div className="container mx-auto min-h-[83vh] p-4 font-karla space-y-6">
      {/* Page Title & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore All Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Discover our curated collection with real-time budget filtering
          </p>
        </div>

        <SortProducts
          products={sortedAndFilteredProducts}
          onChange={(sorted) => {
            // Check order direction to sync currentSort
            if (sorted.length >= 2) {
              const a = sorted[0];
              const b = sorted[1];
              const aP = a.price - (a.price * (a.discountPercentage ?? 0)) / 100;
              const bP = b.price - (b.price * (b.discountPercentage ?? 0)) / 100;
              if (aP < bP) setCurrentSort("asc");
              else if (aP > bP) setCurrentSort("desc");
              else setCurrentSort("default");
            } else {
              setCurrentSort("default");
            }
          }}
        />
      </div>

      {/* Tailwind CSS Price Range Slider (Scrollbar) Component above Product Grid */}
      <PriceRangeSlider
        maxBudgetUSD={maxBudgetUSD}
        onBudgetChange={setMaxBudgetUSD}
        maxPriceUSD={calculatedMaxPriceUSD}
        totalProductsCount={allProducts.length}
        filteredProductsCount={filteredProducts.length}
      />

      {/* Product Grid Area */}
      {filteredProducts.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
            No products found within this budget.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try moving the slider to the right or resetting the budget filter.
          </p>
          <button
            type="button"
            onClick={() => setMaxBudgetUSD(calculatedMaxPriceUSD)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Reset Budget Filter
          </button>
        </div>
      ) : (
        <PaginatedProducts
          products={sortedAndFilteredProducts}
          isLoading={isLoading}
          initialRows={5}
        />
      )}
    </div>
  );
};

export default AllProducts;
