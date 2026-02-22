import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MinioAd() {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    supabase
      .from('ads')
      .select('*')
      .eq('active', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAd(data[Math.floor(Math.random() * data.length)]);
        }
      });
  }, []);

  if (!ad) return null;

  return (
    <a
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl transition-shadow hover:shadow-xl"
      style={{ backgroundColor: ad.bg_color }}
    >
      <div className="relative">
        {ad.image_url && (
          <div className="hidden sm:block absolute inset-y-0 right-0 w-1/2 overflow-hidden">
            <img
              src={ad.image_url}
              alt={ad.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="relative sm:w-1/2 px-6 py-6 sm:px-10 sm:py-8">
          <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: ad.accent_color, opacity: 0.7 }}>
            Annonse
          </span>
          <h3 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: ad.text_color }}>
            {ad.title}
          </h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed" style={{ color: ad.text_color, opacity: 0.7 }}>
            {ad.description}
          </p>
          <div className="mt-4">
            <span
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity group-hover:opacity-90"
              style={{ backgroundColor: ad.accent_color, color: ad.bg_color }}
            >
              {ad.cta}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
