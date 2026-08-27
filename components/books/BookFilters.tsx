'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { FilterState } from '@/lib/types';

export const CATEGORIES = [
  'All',
  'Pakistani & South Asian',
  'Italian & European',
  'Mediterranean & Healthy',
  'Asian & Street Food',
  'Desserts & Baking',
  'Quick & Family Meals',
];

export const CUISINES = [
  'All',
  'Pakistani',
  'Italian',
  'Mediterranean',
  'Asian',
  'French',
  'American',
];

export const POPULAR_TAGS = [
  'Biryani',
  'Curry',
  'Pasta',
  'Healthy',
  'Street Food',
  'Baking',
  '30 Minutes',
  'Halal',
];

export interface BookFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const BookFilters: React.FC<BookFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    (filters.category !== '' && filters.category !== 'All') ||
    (filters.cuisine !== '' && filters.cuisine !== 'All') ||
    filters.selectedTag !== '' ||
    filters.sortBy !== 'featured';

  const updateField = (field: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Top Bar: Search and Sort */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
        className="filter-search-sort"
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search recipe books, cuisines, chef names, dishes..."
            value={filters.searchQuery}
            onChange={(e) => updateField('searchQuery', e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', paddingRight: filters.searchQuery ? '2.5rem' : '1rem' }}
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateField('searchQuery', '')}
              style={{
                position: 'absolute',
                right: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={filters.sortBy}
            onChange={(e) => updateField('sortBy', e.target.value)}
            className="form-select"
            style={{ minWidth: '160px', height: '44px', cursor: 'pointer' }}
          >
            <option value="featured">Featured Chef Picks</option>
            <option value="popular">Most Popular</option>
            <option value="newest">Newly Added</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div style={{ marginBottom: '0.875rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = (filters.category === '' && cat === 'All') || filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => updateField('category', cat === 'All' ? '' : cat)}
                style={{
                  padding: '0.4375rem 0.875rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-base)',
                  boxShadow: isSelected ? 'var(--shadow-primary)' : 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Chips & Quick Result Counter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingTop: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Popular Tags:
          </span>
          {POPULAR_TAGS.map((tag) => {
            const isSelected = filters.selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => updateField('selectedTag', isSelected ? '' : tag)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isSelected ? 'var(--secondary-light)' : 'transparent',
                  color: isSelected ? '#92400E' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid #FDE68A' : '1px solid var(--border-light)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Showing <strong>{totalResults}</strong> cookbook{totalResults !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              style={{
                color: 'var(--primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .filter-search-sort {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
