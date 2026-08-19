import React from 'react';
import { BookCard } from './BookCard';
import { EmptyState } from '../common/EmptyState';
import { Search } from 'lucide-react';
import type { Book } from '../../types';

export interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
  onClearFilters?: () => void;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  isLoading = false,
  onClearFilters,
}) => {
  if (isLoading) {
    return (
      <div className="books-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="surface-card"
            style={{ overflow: 'hidden', padding: '0', display: 'flex', flexDirection: 'column' }}
          >
            <div className="skeleton" style={{ width: '100%', paddingTop: '125%' }} />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton" style={{ height: '16px', width: '40%' }} />
              <div className="skeleton" style={{ height: '24px', width: '90%' }} />
              <div className="skeleton" style={{ height: '16px', width: '60%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div className="skeleton" style={{ height: '28px', width: '35%' }} />
                <div className="skeleton" style={{ height: '36px', width: '45%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={<Search size={32} />}
        title="No recipe books found"
        description="We couldn't find any cookbook matching your current search criteria or category filter. Try clearing filters or searching for different cuisines."
        actionText={onClearFilters ? 'Clear All Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="books-grid">
      {books.map((book) => (
        <div key={book.id} className="animate-fade-in">
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
};
