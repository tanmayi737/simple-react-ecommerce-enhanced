import { FC } from "react";
import { FeatureItem } from "../models/FeatureItem";

const FeatureCard: FC<FeatureItem> = ({ icon, desc, title }) => (
  <div className="flex items-center gap-3.5 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 font-karla">
    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h2 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white leading-tight">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
        {desc}
      </p>
    </div>
  </div>
);

export default FeatureCard;
