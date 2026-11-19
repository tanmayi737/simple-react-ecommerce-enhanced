import { FC, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  MdFavoriteBorder,
  MdOutlineAccountCircle,
  MdOutlineLogout,
} from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { doLogout } from "../redux/features/authSlice";
import { Link } from "react-router-dom";

const CustomPopup: FC = () => {
  const dispatch = useAppDispatch();
  const [isVisible, setVisible] = useState(false);
  const username = useAppSelector((state) => state.authReducer.username);

  const handlePopup = () => {
    setVisible((v) => !v);
  };

  const handleLogout = () => {
    dispatch(doLogout());
    hidePopup();
  };

  const hidePopup = () => {
    setVisible(false);
  };

  return (
    <div className="relative font-karla">
      <div
        className="inline-block cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 font-bold text-sm text-slate-800 dark:text-white transition-colors"
        onClick={handlePopup}
        data-test="username-popup"
      >
        {username}
      </div>
      {isVisible && (
        <div
          className="absolute p-3 left-[-60px] w-48 z-50 mt-2 rounded-xl shadow-xl bg-white ring-1 ring-slate-200 dark:ring-slate-700 dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 animate-fade-in"
          data-test="popup-content-list"
        >
          <div className="space-y-1 text-sm font-medium">
            <Link
              to="/account"
              onClick={hidePopup}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MdOutlineAccountCircle className="text-lg text-slate-400" />
              <span>Your Account</span>
            </Link>

            <Link
              to="/orders"
              onClick={hidePopup}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              data-test="orders-link"
            >
              <FiPackage className="text-lg text-slate-400" />
              <span>Order History</span>
            </Link>

            <Link
              to="/wishlist"
              onClick={hidePopup}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              data-test="wishlist-container"
            >
              <MdFavoriteBorder className="text-lg text-slate-400" />
              <span>Wishlist</span>
            </Link>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleLogout}
                data-test="logout-btn"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer text-left"
              >
                <MdOutlineLogout className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPopup;
