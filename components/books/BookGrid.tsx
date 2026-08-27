'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { BookCard } from './BookCard';
import { EmptyState } from '../common/EmptyState';
import type { Book } from '@/lib/types';

export interface BookGridProps {
  books: Book[];
  loading?: boolean;
  onResetFilters?: () => void;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  loading = false,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="books-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="surface-card"
            style={{
              height: '420px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="skeleton" style={{ width: '100%', height: '240px' }} />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <div className="skeleton" style={{ width: '60%', height: '14px' }} />
              <div className="skeleton" style={{ width: '90%', height: '20px' }} />
              <div className="skeleton" style={{ width: '40%', height: '14px' }} />
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '70px', height: '24px' }} />
                <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: 'var(--radius-md)' }} />
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
        icon={<BookOpen size={36} />}
        title="No recipe books found"
        description="We couldn't find any cookbooks matching your filter criteria. Try adjusting your search query, selecting another category, or resetting all filters."
        actionText={onResetFilters ? 'Reset All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="books-grid animate-fade-in" id="cookbook-catalog">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};
