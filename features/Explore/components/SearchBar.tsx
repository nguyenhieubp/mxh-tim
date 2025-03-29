interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
}

import { useTranslation } from 'react-i18next';

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-lg outline-none"
      />
    </div>
  );
};

export default SearchBar;