import { FC } from "react";
import { Product } from "../models/Product";
import RatingStar from "./RatingStar";
import { addToCart } from "../redux/features/cartSlice";
import { useAppDispatch } from "../redux/hooks";
import toast from "react-hot-toast";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { Link } from "react-router-dom";
import PriceSection from "./PriceSection";
import useAuth from "../hooks/useAuth";
import AIProductOverview from "./AIProductOverview";

const ProductCard: FC<Product> = (props) => {
  const {
    id,
    price,
    thumbnail,
    title,
    category,
    rating,
    discountPercentage,
  } = props;

  const dispatch = useAppDispatch();
  const { requireAuth } = useAuth();

  const addCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      dispatch(
        addToCart({
          id,
          price,
          title,
          category,
          rating,
          thumbnail,
          discountPercentage,
        })
      );
      toast.success("item added to cart successfully", {
        duration: 3000,
      });
    });
  };

  return (
    <div
      className="group flex flex-col justify-between bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden font-lato"
      data-test="product-card"
    >
      <div>
        {/* Product Image Area */}
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-700/40 p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-center h-56">
          <Link
            to={`/product/${id}`}
            className="w-full h-full flex items-center justify-center"
          >
            <img
              src={thumbnail}
              alt={title}
              className="max-h-48 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>

          {discountPercentage && Math.round(discountPercentage) > 0 && (
            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              -{Math.round(discountPercentage)}%
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
              {category}
            </span>
          </div>

          <Link
            className="font-bold text-base text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 block transition-colors"
            to={`/product/${id}`}
            title={title}
          >
            {title}
          </Link>

          <div className="pt-0.5">
            <RatingStar rating={rating} />
          </div>
        </div>

        {/* AI Overview for each item */}
        <div className="px-4 pb-2">
          <AIProductOverview
            product={props}
            variant="modal-trigger"
            buttonClassName="w-full py-1.5 px-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-700/80 dark:via-slate-700/80 dark:to-slate-800 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-white border border-indigo-200/70 dark:border-indigo-900/60 text-xs font-semibold rounded-lg shadow-2xs hover:shadow-xs"
          />
        </div>
      </div>

      {/* Footer / Price & Add to Cart */}
      <div className="flex items-center justify-between px-4 pb-4 pt-1 mt-auto border-t border-slate-100 dark:border-slate-700/60">
        <div>
          <PriceSection
            discountPercentage={discountPercentage || 0}
            price={price}
            size="md"
          />
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-2.5 sm:px-3 sm:py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={addCart}
          data-test="add-cart-btn"
          title="Add to cart"
        >
          <AiOutlineShoppingCart className="text-lg" />
          <span className="hidden sm:inline text-xs font-semibold">Add</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
