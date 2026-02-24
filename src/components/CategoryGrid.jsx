import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryIcons from '../data/categoryIcons';
import useAdminStore from '../stores/useAdminStore';

export default function CategoryGrid({ variant = 'default' }) {
  const categories = useAdminStore((state) => state.categories);
  const fetchCategories = useAdminStore((state) => state.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/search?category=${category.slug}`}
            className="flex flex-col items-center gap-2 rounded-lg bg-white/10 px-4 py-4 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <div className="h-8 w-8">{categoryIcons[category.slug]}</div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/search?category=${category.slug}`}
          className="group rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
        >
          <div className="mb-3 h-8 w-8 text-gray-600">{categoryIcons[category.slug]}</div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-500">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{category.description}</p>
        </Link>
      ))}
    </div>
  );
}
