// frontend/src/components/SearchBar.js
import './SearchBar.css';
import { useTranslation } from "react-i18next";
// It now receives the term and a function to call on change
function SearchBar({ searchTerm, onSearchTermChange , theme = 'dark'  }) {
  const { t } = useTranslation();
  return (
    <div className={`search-container theme-${theme}`}>
      <svg className="search-icon" /* ... same svg ... */>
        {/* ... svg path ... */}
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder={t("search_placeholder")}
        value={searchTerm}
        // Just call the function passed from the parent on every change
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
      {/* The search button is no longer needed! */}
    </div>
  );
}
export default SearchBar;