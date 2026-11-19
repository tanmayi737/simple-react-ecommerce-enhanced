import { FC, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { Product } from "../models/Product";
import { updateLoading } from "../redux/features/homeSlice";
import SortProducts from "../components/SortProducts";
import PaginatedProducts from "../components/PaginatedProducts";
import PriceRangeSlider from "../components/PriceRangeSlider";
import { API_ENDPOINTS } from "../api";

const SingleCategory: FC = () => {
  const dispatch = useAppDispatch();
  const { slug } = useParams();
  const [productList, setProductList] = useState<Product[]>([]);
  const isLoading = useAppSelector((state) => state.homeReducer.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = () => {
      dispatch(updateLoading(true));
      fetch(`${API_ENDPOINTS.PRODUCTS_CATEGORY_ID.replace(":id", slug || "")}`)
        .then((res) => res.json())
        .then((data) => {
          const { products } = data;
          setProductList(products || []);
          dispatch(updateLoading(false));
        });
    };

    fetchProducts();
  }, [slug, dispatch]);

  const calculatedMaxPriceUSD = useMemo(() => {
    if (productList.length === 0) return 2000;
    const maxVal = Math.max(...productList.map((p) => p.price));
    return Math.max(Math.ceil(maxVal / 50) * 50, 100);
  }, [productList]);

  const [maxBudgetUSD, setMaxBudgetUSD] = useState<number>(2000);
  const [currentSort, setCurrentSort] = useState<string>("default");

  useEffect(() => {
    if (calculatedMaxPriceUSD > 0) {
      setMaxBudgetUSD(calculatedMaxPriceUSD);
    }
  }, [calculatedMaxPriceUSD]);

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const discount = product.discountPercentage ?? 0;
      const effectivePriceUSD =
        product.price - (product.price * discount) / 100;
      return effectivePriceUSD <= maxBudgetUSD;
    });
  }, [productList, maxBudgetUSD]);

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
      {/* Category Header Breadcrumb & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Categories
          </button>
          <span>/</span>
          <span className="font-extrabold capitalize text-slate-900 dark:text-white">
            {slug?.replace(/-/g, " ")}
          </span>
        </div>

        <SortProducts
          products={sortedAndFilteredProducts}
          onChange={(sorted) => {
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
        totalProductsCount={productList.length}
        filteredProductsCount={filteredProducts.length}
      />

      <PaginatedProducts
        products={sortedAndFilteredProducts}
        isLoading={isLoading}
        initialRows={5}
      />
    </div>
  );
};

export default SingleCategory;
