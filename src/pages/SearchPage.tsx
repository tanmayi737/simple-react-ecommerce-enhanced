import { FC, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Product } from "../models/Product";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updateLoading } from "../redux/features/homeSlice";
import { addProducts } from "../redux/features/productSlice";
import SortProducts from "../components/SortProducts";
import PaginatedProducts from "../components/PaginatedProducts";
import PriceRangeSlider from "../components/PriceRangeSlider";
import { API_ENDPOINTS } from "../api";
import { searchProductsNatural, tokenizeQuery } from "../utils/naturalSearch";

interface Category {
  slug: string;
  name: string;
  url: string;
}

const SearchPage: FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryResults, setCategoryResults] = useState<Category[]>([]);
  const [notFound, setNotFound] = useState(false);
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.homeReducer.isLoading);
  const allProductsStore = useAppSelector(
    (state) => state.productReducer.allProducts
  );
  const navigate = useNavigate();

  const queryTokens = useMemo(() => tokenizeQuery(query), [query]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setNotFound(true);
        return;
      }

      dispatch(updateLoading(true));
      setNotFound(false);

      try {
        // Fetch or retrieve complete product catalog for deep natural language search across titles, descriptions, and tags
        let pool = allProductsStore;

        if (pool.length === 0) {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?limit=250`);
          const data = await res.json();
          pool = data.products || [];
          dispatch(addProducts(pool));
        }

        // Perform natural language search matching tokens against titles, descriptions, tags, category, and brand
        const naturalMatches = searchProductsNatural(pool, query);

        if (naturalMatches.length > 0) {
          setProducts(naturalMatches);
          setCategoryResults([]);
        } else {
          // Check categories fallback
          const categoriesResponse = await fetch(
            `${API_ENDPOINTS.PRODUCTS_CATEGORIES}`
          );
          const categoriesData = await categoriesResponse.json();

          const matchedCategories = categoriesData.filter(
            (cat: Category) =>
              cat.name.toLowerCase().includes(query.toLowerCase()) ||
              cat.slug.toLowerCase().includes(query.toLowerCase())
          );

          if (matchedCategories.length > 0) {
            setCategoryResults(matchedCategories);
            setProducts([]);
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error("Search error:", error);
        setNotFound(true);
      } finally {
        dispatch(updateLoading(false));
      }
    };

    searchProducts();
  }, [query, dispatch, allProductsStore]);

  const calculatedMaxPriceUSD = useMemo(() => {
    if (products.length === 0) return 2000;
    const maxVal = Math.max(...products.map((p) => p.price));
    return Math.max(Math.ceil(maxVal / 50) * 50, 100);
  }, [products]);

  const [maxBudgetUSD, setMaxBudgetUSD] = useState<number>(2000);
  const [currentSort, setCurrentSort] = useState<string>("default");

  useEffect(() => {
    if (calculatedMaxPriceUSD > 0) {
      setMaxBudgetUSD(calculatedMaxPriceUSD);
    }
  }, [calculatedMaxPriceUSD]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const discount = product.discountPercentage ?? 0;
      const effectivePriceUSD =
        product.price - (product.price * discount) / 100;
      return effectivePriceUSD <= maxBudgetUSD;
    });
  }, [products, maxBudgetUSD]);

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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Search results for:{" "}
            <span className="text-blue-600 dark:text-blue-400">"{query}"</span>
          </h1>

          {/* Natural language query token pills */}
          {queryTokens.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                NL Tokens ({queryTokens.length}):
              </span>
              {queryTokens.map((token) => (
                <span
                  key={token}
                  className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/60"
                >
                  #{token}
                </span>
              ))}
            </div>
          )}
        </div>

        {products.length > 0 && (
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
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : notFound ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 space-y-2">
          <p className="text-2xl font-bold text-slate-800 dark:text-white">
            Sorry, no such product was found.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try searching with natural language keywords like "noise cancelling headphones", "laptops", or "shoes".
          </p>
        </div>
      ) : categoryResults.length > 0 ? (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-slate-800 dark:text-white">
            No products found, but here are matching categories:
          </p>
          <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3">
            {categoryResults.map((category) => (
              <div
                key={category.slug}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer shadow-xs hover:shadow-md transition-all group"
                onClick={() => navigate(`/category/${category.slug}`)}
              >
                <div className="font-bold text-base text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  View products →
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {products.length > 0 && (
            <PriceRangeSlider
              maxBudgetUSD={maxBudgetUSD}
              onBudgetChange={setMaxBudgetUSD}
              maxPriceUSD={calculatedMaxPriceUSD}
              totalProductsCount={products.length}
              filteredProductsCount={filteredProducts.length}
            />
          )}

          <PaginatedProducts
            products={sortedAndFilteredProducts}
            isLoading={isLoading}
            initialRows={5}
          />
        </>
      )}
    </div>
  );
};

export default SearchPage;
