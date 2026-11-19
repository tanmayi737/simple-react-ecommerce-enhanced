import { FC, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { setCartState } from "../redux/features/cartSlice";
import { updateModal } from "../redux/features/authSlice";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FaUser } from "react-icons/fa";
import CustomPopup from "./CustomPopup";
import { updateDarkMode } from "../redux/features/homeSlice";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import SearchBar from "./SearchBar";
import CurrencyToggle from "./CurrencyToggle";

const Navbar: FC = () => {
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useAppSelector(
    (state) => state.cartReducer.cartItems.length
  );
  const username = useAppSelector((state) => state.authReducer.username);
  const isDarkMode = useAppSelector((state) => state.homeReducer.isDarkMode);
  const { requireAuth } = useAuth();

  const showCart = () => {
    requireAuth(() => dispatch(setCartState(true)));
  };

  const toggleTheme = () => {
    dispatch(updateDarkMode(!isDarkMode));
    document.body.classList.toggle("dark");
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs font-karla transition-colors duration-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white group flex-shrink-0"
            data-test="main-logo"
          >
            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shadow-xs group-hover:bg-blue-700 transition-colors">
              S
            </span>
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Shopify
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar onSearch={() => setIsMenuOpen(false)} />
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 text-slate-700 dark:text-slate-200">
            <Link
              to="/products"
              className="font-bold text-sm xl:text-base px-3 py-1.5 rounded-xl hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
              data-test="main-products"
            >
              Products
            </Link>

            <Link
              to="/categories"
              className="font-bold text-sm xl:text-base px-3 py-1.5 rounded-xl hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
              data-test="main-categories"
            >
              Categories
            </Link>

            {/* Currency Toggle Utility */}
            <CurrencyToggle showRateBadge />

            {/* User Account / Login */}
            <div className="flex items-center">
              {username !== "" ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src="https://robohash.org/Terry.png?set=set4"
                    alt="avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <CustomPopup />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch(updateModal(true))}
                  className="flex items-center gap-1.5 font-bold text-sm px-3 py-1.5 rounded-xl hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
                  data-test="login-btn"
                >
                  <FaUser className="text-slate-500 dark:text-slate-400 text-sm" />
                  <span>Login</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
              onClick={showCart}
              data-test="cart-btn"
              aria-label="Open shopping cart"
            >
              <AiOutlineShoppingCart className="text-2xl" />
              <div
                className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-extrabold h-5 min-w-[20px] px-1 rounded-full grid place-items-center shadow-xs"
                data-test="cart-item-count"
              >
                {cartCount}
              </div>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <MdOutlineLightMode className="text-2xl text-amber-400" />
              ) : (
                <MdOutlineDarkMode className="text-2xl text-slate-700" />
              )}
            </button>
          </div>

          {/* Tablet/Mobile Fast Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <CurrencyToggle className="hidden sm:flex" />

            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={showCart}
              data-test="cart-btn"
              aria-label="Open cart"
            >
              <AiOutlineShoppingCart className="text-2xl" />
              <div
                className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full grid place-items-center"
                data-test="cart-item-count"
              >
                {cartCount}
              </div>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative z-30"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown / Drawer Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[61px] bg-black/50 backdrop-blur-xs z-30 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
              <div>
                <SearchBar onSearch={() => setIsMenuOpen(false)} />
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Select Currency:
                </span>
                <CurrencyToggle showRateBadge />
              </div>

              <nav className="flex flex-col gap-3 font-semibold text-lg text-slate-800 dark:text-slate-100">
                <Link
                  to="/products"
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  data-test="main-products"
                  onClick={handleLinkClick}
                >
                  Products
                </Link>

                <Link
                  to="/categories"
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  data-test="main-categories"
                  onClick={handleLinkClick}
                >
                  Categories
                </Link>

                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={handleLinkClick}
                >
                  Order History
                </Link>
              </nav>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {username !== "" ? (
                    <div className="flex items-center gap-2">
                      <img
                        src="https://robohash.org/Terry.png?set=set4"
                        alt="avatar"
                        className="w-7 h-7 rounded-full"
                      />
                      <CustomPopup />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white hover:text-blue-600"
                      onClick={() => {
                        dispatch(updateModal(true));
                        setIsMenuOpen(false);
                      }}
                      data-test="login-btn"
                    >
                      <FaUser className="text-slate-500 text-sm" />
                      <span>Profile / Login</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                >
                  {isDarkMode ? (
                    <>
                      <MdOutlineLightMode className="text-amber-400 text-lg" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <MdOutlineDarkMode className="text-slate-700 text-lg" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
