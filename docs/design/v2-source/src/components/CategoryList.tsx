import React from 'react';

export type CategoryType = 'semua' | 'nasi' | 'mie' | 'minuman' | 'camilan';

interface CategoryListProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

interface CategoryItemConfig {
  id: CategoryType;
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: CategoryItemConfig[] = [
    {
      id: 'semua',
      label: 'Semua',
      icon: (active) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          {/* Fork & Knife icon matching screenshot */}
          <path d="M18 2v20M18 8a3 3 0 0 1-3-3V2" />
          <path d="M6 2v7a3 3 0 0 0 3 3v10" />
          <path d="M9 2v4" />
        </svg>
      ),
    },
    {
      id: 'nasi',
      label: 'Nasi',
      icon: (active) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          {/* Rice bowl with rising steam */}
          <path d="M4 11h16a8 8 0 0 1-16 0Z" />
          <path d="M8 20h8" />
          <path d="M9 7c0-1.5 1-2 1-3" />
          <path d="M14 7c0-1.5 1-2 1-3" />
        </svg>
      ),
    },
    {
      id: 'mie',
      label: 'Mie',
      icon: (active) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          {/* Noodle bowl with handles / pot matching screenshot */}
          <path d="M3 11h18" />
          <path d="M5 11c0 5 3.5 8 7 8s7-3 7-8" />
          <path d="M7 7h10" />
          <path d="M10 4h4" />
          <path d="M2 13h2" />
          <path d="M20 13h2" />
        </svg>
      ),
    },
    {
      id: 'minuman',
      label: 'Minuman',
      icon: (active) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          {/* Cup with handle & steam */}
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <path d="M6 2v2" />
          <path d="M10 2v2" />
          <path d="M14 2v2" />
        </svg>
      ),
    },
    {
      id: 'camilan',
      label: 'Camilan',
      icon: (active) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          {/* Cookie with bite & chocolate chips */}
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
          <path d="M8.5 8.5v.01" />
          <path d="M16 15.5v.01" />
          <path d="M8.5 15.5v.01" />
          <path d="M12 12v.01" />
        </svg>
      ),
    },
  ];

  return (
    <section className="px-5 py-3">
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 group focus:outline-hidden"
              aria-label={`Kategori ${cat.label}`}
            >
              {/* Category Icon Box */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  isActive
                    ? 'bg-[#E44222] text-white shadow-md shadow-orange-600/20 scale-105'
                    : 'bg-[#FFF0EB] text-[#E44222] hover:bg-[#FFE6DC] group-hover:scale-102'
                }`}
              >
                {cat.icon(isActive)}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-bold transition-colors ${
                  isActive ? 'text-[#E44222]' : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
