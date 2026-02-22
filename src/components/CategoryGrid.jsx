import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryIcons from '../data/categoryIcons';
import { supabase } from '../lib/supabase';

const INITIAL_COUNT = 12;

export default function CategoryGrid({ variant = 'default' }) {
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCategories(data || []));
  }, []);

  if (variant === 'compact') {
    const visible = showAll ? categories : categories.slice(0, INITIAL_COUNT);
    return (
      <div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visible.map((category) => (
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
        {!showAll && categories.length > INITIAL_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mx-auto mt-4 block rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
          >
            Vis flere
          </button>
        )}
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
