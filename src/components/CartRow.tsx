import { FC } from "react";
import { CartItem } from "../models/CartItem";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";
import { useAppDispatch } from "../redux/hooks";
import {
  addToCart,
  reduceFromCart,
  removeFromCart,
} from "../redux/features/cartSlice";
import { RiDeleteBin6Line } from "react-icons/ri";
import useDiscount from "../hooks/useDiscount";
import { useCurrency } from "../hooks/useCurrency";

const CartRow: FC<CartItem> = ({
  id,
  thumbnail,
  title,
  price,
  quantity,
  rating,
  category,
  discountPercentage = 0,
}) => {
  const dispatch = useAppDispatch();
  const result = useDiscount({ price, discount: discountPercentage });
  const { formatPrice } = useCurrency();

  return (
    <div className="grid grid-cols-7 gap-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/60 p-2.5 rounded-xl shadow-sm items-center hover:shadow-md transition-shadow">
      <div className="col-span-2 h-20 w-full bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-1">
        <img src={thumbnail} alt={title} className="h-full w-full object-contain" />
      </div>

      <div className="col-span-3 space-y-1">
        <h3 className="font-bold text-sm leading-tight text-slate-800 dark:text-white line-clamp-1">
          {title}
        </h3>
        <div className="flex space-x-1.5 items-center">
          <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
            {formatPrice(result)}
          </h3>
          {discountPercentage !== 0 && (
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1 py-0.5 rounded">
              -{Math.round(discountPercentage)}%
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
          <IoIosRemoveCircleOutline
            className="cursor-pointer hover:text-blue-600 text-lg transition-colors"
            onClick={() => dispatch(reduceFromCart(id))}
            data-test="cart-reduce-btn"
          />
          <span
            data-test="cart-item-quantity"
            className="font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md min-w-[24px] text-center"
          >
            {quantity}
          </span>
          <IoIosAddCircleOutline
            className="cursor-pointer hover:text-blue-600 text-lg transition-colors"
            data-test="cart-increase-btn"
            onClick={() =>
              dispatch(
                addToCart({
                  id,
                  title,
                  price,
                  quantity,
                  thumbnail,
                  rating,
                  category,
                })
              )
            }
          />
        </div>
      </div>

      <div className="font-bold col-span-2 flex flex-col items-end justify-between h-full py-1">
        {quantity && (
          <span
            data-test="cart-item-price"
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white"
          >
            {formatPrice(result * quantity)}
          </span>
        )}
        <button
          type="button"
          onClick={() => dispatch(removeFromCart(id))}
          data-test="cart-remove-btn"
          className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Remove item"
        >
          <RiDeleteBin6Line className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default CartRow;
