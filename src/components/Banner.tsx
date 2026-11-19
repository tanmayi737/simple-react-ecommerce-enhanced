import { FC } from "react";
import { Link } from "react-router-dom";

const Banner: FC = () => (
  <div className="container mt-10 mx-auto px-4 md:flex font-lora">
    <div className="w-full md:flex rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80">
      <img src="/banner.jpg" alt="banner" className="md:w-1/2 object-cover" />
      <div className="bg-[#e3edf6] dark:bg-slate-700 dark:text-white md:w-1/2 flex flex-col items-center text-center justify-center p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">Don't miss the offer!</h1>
        <h2 className="text-2xl font-semibold mb-5 text-slate-700 dark:text-slate-200">Grab it now</h2>
        <Link
          to="/products"
          className="inline-block bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-xl px-8 py-3.5 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
          data-test="banner-btn"
        >
          Shop Now
        </Link>
      </div>
    </div>
  </div>
);

export default Banner;
