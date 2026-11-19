import { FC, useState, KeyboardEvent } from "react";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  onSearch?: () => void;
  className?: string;
}

const SearchBar: FC<SearchBarProps> = ({ onSearch, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      onSearch?.();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`relative flex items-center w-full max-w-md bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all duration-200 overflow-hidden ${className}`}
    >
      <input
        type="text"
        placeholder="Try 'noise cancelling blue headphones'..."
        className="w-full pl-4 pr-10 py-2 text-sm bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        aria-label="Search products with natural language"
      />
      <button
        type="button"
        className="absolute right-1 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center cursor-pointer shadow-xs"
        onClick={handleSearch}
        aria-label="Submit search"
      >
        <BsSearch className="text-xs sm:text-sm" />
      </button>
    </div>
  );
};

export default SearchBar;
