import { FC } from "react";
import { Link } from "react-router-dom";
import { useCurrency } from "../hooks/useCurrency";

const HeroSection: FC = () => {
  const { currency } = useCurrency();

  return (
    <div className="bg-[#e3edf6] dark:bg-slate-700 font-lora">
      <div className="container px-4 grid md:grid-cols-2 py-8 mx-auto">
        <div className="flex items-center">
          <div className="max-w-[450px] space-y-4">
            <p className="text-black dark:text-white font-medium">
              Starting At{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {currency === "INR" ? "₹999" : "$12"}
              </span>
            </p>
            <h2 className="text-black font-bold text-4xl md:text-5xl dark:text-white leading-tight">
              The best notebook collection 2025
            </h2>
            <h3 className="text-2xl dark:text-white">
              Exclusive offer <span className="text-red-600 font-semibold">-50%</span> off
              this week
            </h3>
            <Link
              to="/category/laptops"
              data-test="hero-btn"
              className="inline-block bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl px-6 py-3 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              Shop Now
            </Link>
          </div>
        </div>
        <div>
          <img src="/hero.png" alt="hero" className="ml-auto" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
