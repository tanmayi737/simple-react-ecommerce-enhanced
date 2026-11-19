import { FC, useMemo, useState } from "react";
import { Product } from "../models/Product";
import { generateProductAIOverview, CompactAIOverviewData } from "../utils/aiOverview";
import { FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

interface AIProductOverviewProps {
  product: Product;
  className?: string;
  variant?: "inline" | "modal-trigger";
  buttonClassName?: string;
}

const AIProductOverview: FC<AIProductOverviewProps> = ({
  product,
  className = "",
  variant = "inline",
  buttonClassName = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute the compact 4-point overview
  const overview: CompactAIOverviewData = useMemo(() => {
    return generateProductAIOverview(product);
  }, [product]);

  // Clean, compact single card featuring exactly the four items
  const renderCompactCard = () => (
    <div
      className="rounded-xl border border-indigo-200/90 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/90 p-4 shadow-sm space-y-3 font-karla text-left"
      data-test="ai-overview-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
          <HiSparkles className="text-base text-indigo-600 dark:text-indigo-400" />
          <span>AI Review Overview</span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-slate-600">
          Gemini Synthesis
        </span>
      </div>

      {/* Exactly the 4 items: Star Rating, Praise, Critic, Recommended Use */}
      <div className="space-y-2 text-xs sm:text-sm">
        {/* 1. Star Rating */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[155px] flex-shrink-0">
            ⭐ Star Rating:
          </span>
          <span className="font-extrabold text-amber-500 dark:text-amber-400">
            {overview.starRatingText}
          </span>
        </div>

        {/* 2. Single-point Praise */}
        <div className="flex items-start gap-2">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 min-w-[155px] flex-shrink-0">
            ✓ Single-point Praise:
          </span>
          <span className="text-slate-700 dark:text-slate-200 leading-snug">
            {overview.praise}
          </span>
        </div>

        {/* 3. Single-point Critic */}
        <div className="flex items-start gap-2">
          <span className="font-bold text-amber-600 dark:text-amber-400 min-w-[155px] flex-shrink-0">
            ⚠ Single-point Critic:
          </span>
          <span className="text-slate-700 dark:text-slate-200 leading-snug">
            {overview.critic}
          </span>
        </div>

        {/* 4. Recommended Use */}
        <div className="flex items-start gap-2">
          <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[155px] flex-shrink-0">
            🎯 Recommended Use:
          </span>
          <span className="text-slate-700 dark:text-slate-200 leading-snug">
            {overview.recommendedUse}
          </span>
        </div>
      </div>
    </div>
  );

  // Modal variant trigger for ProductCard
  if (variant === "modal-trigger") {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          data-test="ai-overview-btn"
          className={`inline-flex items-center justify-center gap-1.5 font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            buttonClassName
              ? buttonClassName
              : "px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-300 text-xs shadow-2xs"
          }`}
          title={`View AI Review Overview for ${product.title}`}
        >
          <HiSparkles className="text-sm" />
          <span>✨ AI Overview</span>
        </button>

        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-karla"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-8 h-8 object-contain rounded bg-slate-50 dark:bg-slate-700 p-0.5 flex-shrink-0"
                  />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {product.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {renderCompactCard()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Inline variant (SingleProduct page - appears ONCE as a clean compact single card)
  return (
    <div className={className} data-test="ai-overview-container">
      {renderCompactCard()}
    </div>
  );
};

export default AIProductOverview;
