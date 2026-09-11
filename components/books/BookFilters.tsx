'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { FilterState } from '@/lib/types';

export const CATEGORIES = [
  'All',
  'Italian & European',
  'Mediterranean & Healthy',
  'Desserts & Baking',
  'Quick & Family Meals',
  'British & American Classics',
  'International / Western',
];

export const CUISINES = [
  'All',
  'Italian',
  'Mediterranean',
  'French',
  'American',
  'British',
  'International / Western',
];

export const POPULAR_TAGS = [
  'Chocolate',
  'Pasta',
  'Baking',
  'Healthy',
  'Patisserie',
  '30 Minutes',
  'Comfort Food',
  'Cakes',
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
    <div className="book-filters" style={{ marginBottom: '1.5rem' }}>
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
              pointerEvents: 'none',
            }}
          >
            <Search size={18} />
          </span>
          <input
            type="search"
            enterKeyHint="search"
            placeholder="Search cookbooks, cuisines, chefs..."
            value={filters.searchQuery}
            onChange={(e) => updateField('searchQuery', e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', paddingRight: filters.searchQuery ? '2.5rem' : '1rem' }}
            aria-label="Search cookbooks"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => updateField('searchQuery', '')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                minWidth: 32,
                minHeight: 32,
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-sort-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={filters.sortBy}
            onChange={(e) => updateField('sortBy', e.target.value)}
            className="form-select"
            style={{ minWidth: '180px', cursor: 'pointer' }}
            aria-label="Sort cookbooks"
          >
            <option value="featured">Featured Chef Picks</option>
            <option value="popular">Most Popular</option>
            <option value="newest">Newly Added</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category pills — intentional horizontal scroll on mobile */}
      <div className="category-scroll" role="tablist" aria-label="Cookbook categories">
        <div className="category-scroll-track">
          {CATEGORIES.map((cat) => {
            const isSelected = (filters.category === '' && cat === 'All') || filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => updateField('category', cat === 'All' ? '' : cat)}
                className="category-pill"
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-base)',
                  boxShadow: isSelected ? 'var(--shadow-primary)' : 'var(--shadow-xs)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags + result count */}
      {/* <div className="filter-meta-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            className="hide-below-md"
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Popular Tags:
          </span>
          {POPULAR_TAGS.map((tag) => {
            const isSelected = filters.selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => updateField('selectedTag', isSelected ? '' : tag)}
                className="tag-chip"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.375rem 0.7rem',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isSelected ? 'var(--secondary-light)' : 'var(--bg-surface)',
                  color: isSelected ? '#FBBF24' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid rgba(232, 163, 23, 0.35)' : '1px solid var(--border-light)',
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
              type="button"
              onClick={onReset}
              style={{
                color: 'var(--primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                minHeight: 36,
              }}
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
      </div> */}
    </div>
  );
};
