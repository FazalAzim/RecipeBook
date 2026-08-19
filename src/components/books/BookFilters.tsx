import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import type { FilterState } from '../../types';

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
  'Pasta',
  'Healthy',
  'Wok',
  'Baking',
  'One Pot',
  '30 Minutes',
  'Street Food',
];

export interface BookFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export const BookFilters: React.FC<BookFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    (filters.category && filters.category !== 'All') ||
    (filters.cuisine && filters.cuisine !== 'All') ||
    filters.selectedTag ||
    filters.sortBy !== 'featured'
  );

  return (
    <div
      className="surface-card"
      style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      {/* Top Row: Search Input & Sort & Reset */}
      <div
        style={{
          display: 'flex',
          gap: '0.875rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 320px', position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by title, chef/author, ingredients, cuisine..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="form-input"
            style={{
              paddingLeft: '2.5rem',
              paddingRight: filters.searchQuery ? '2.5rem' : '0.875rem',
            }}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              style={{
                position: 'absolute',
                right: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                background: 'none',
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Cuisine Dropdown */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            value={filters.cuisine}
            onChange={(e) => onChange({ ...filters, cuisine: e.target.value })}
            className="form-select"
            aria-label="Filter by Cuisine"
          >
            <option value="All">All Cuisines</option>
            {CUISINES.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>
                {c} Cuisine
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div style={{ flex: '0 1 190px' }}>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            className="form-select"
            aria-label="Sort books"
          >
            <option value="featured">Featured First</option>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest Releases</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Active Filters Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-berry)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = (filters.category === cat) || (!filters.category && cat === 'All');
          return (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat === 'All' ? '' : cat })}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-pill)',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.875rem',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Popular Tags Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Trending:
        </span>
        {POPULAR_TAGS.map((tag) => {
          const isTagActive = filters.selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onChange({ ...filters, selectedTag: isTagActive ? '' : tag })}
              className={`badge ${isTagActive ? 'badge-primary' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', transition: 'all var(--transition-fast)' }}
            >
              #{tag}
              {isTagActive && <X size={10} style={{ marginLeft: '2px' }} />}
            </button>
          );
        })}

        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{totalResults}</strong> cookbook{totalResults === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
};
