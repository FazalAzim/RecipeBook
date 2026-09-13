import type { Book } from './types';

export interface BookOffer {
  price: number;
  compareAtPrice: number;
  percentOff: number;
}

/** Normalize optional compare-at from form/API input. Returns undefined when empty/invalid. */
export function parseCompareAtPrice(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Number(n.toFixed(2));
}

/**
 * Returns offer details when compare-at is set and higher than the sale price.
 * Checkout always uses `price` — this is display-only.
 */
export function getOffer(
  book: Pick<Book, 'price' | 'compareAtPrice'>
): BookOffer | null {
  const price = Number(book.price);
  const compareAtPrice = Number(book.compareAtPrice);

  if (!Number.isFinite(price) || !Number.isFinite(compareAtPrice)) return null;
  if (compareAtPrice <= price) return null;

  const percentOff = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  if (percentOff < 1) return null;

  return {
    price,
    compareAtPrice,
    percentOff,
  };
}
