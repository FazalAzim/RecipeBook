'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import type { Book, CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (bookId: string) => boolean;
  getItemQuantity: (bookId: string) => number;
  totalItems: number;
  subtotal: number;
  total: number;
}

const GUEST_CART_KEY = 'recipebooks_guest_cart';
const USER_CART_PREFIX = 'recipebooks_user_cart_';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getStorageKey = useCallback(() => {
    return user ? `${USER_CART_PREFIX}${user.id}` : GUEST_CART_KEY;
  }, [user]);

  // Load cart on mount or user switch, merging guest cart if user just logged in
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const activeKey = getStorageKey();
    const rawActive = localStorage.getItem(activeKey);
    let currentItems: CartItem[] = rawActive ? JSON.parse(rawActive) : [];

    if (user) {
      const rawGuest = localStorage.getItem(GUEST_CART_KEY);
      if (rawGuest) {
        try {
          const guestItems: CartItem[] = JSON.parse(rawGuest);
          if (guestItems.length > 0) {
            guestItems.forEach((guestItem) => {
              const existing = currentItems.find((i) => i.bookId === guestItem.bookId);
              if (existing) {
                existing.quantity += guestItem.quantity;
                existing.subtotal = Number((existing.unitPrice * existing.quantity).toFixed(2));
              } else {
                currentItems.push(guestItem);
              }
            });
            localStorage.removeItem(GUEST_CART_KEY);
            localStorage.setItem(activeKey, JSON.stringify(currentItems));
            showToast('Guest cart merged with your account!', 'info');
          }
        } catch (e) {
          console.warn('Error merging guest cart:', e);
        }
      }
    }

    setItems(currentItems);
    setIsLoaded(true);
  }, [user, getStorageKey, showToast]);

  // Persist cart items whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    const activeKey = getStorageKey();
    localStorage.setItem(activeKey, JSON.stringify(items));
  }, [items, isLoaded, getStorageKey]);

  const addItem = useCallback(
    (book: Book, quantityToAdd = 1) => {
      if (book.comingSoon) {
        showToast(`"${book.title}" is coming soon and cannot be purchased yet.`, 'info');
        return;
      }

      const qty = Math.max(1, quantityToAdd);
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.bookId === book.id);
        let updated: CartItem[];

        if (existingIndex > -1) {
          const existing = prevItems[existingIndex];
          const newQty = existing.quantity + qty;
          const newSubtotal = Number((existing.unitPrice * newQty).toFixed(2));

          updated = [...prevItems];
          updated[existingIndex] = {
            ...existing,
            quantity: newQty,
            subtotal: newSubtotal,
          };
        } else {
          const lineSubtotal = Number((book.price * qty).toFixed(2));
          const newItem: CartItem = {
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverImageUrl: book.coverImageUrl,
            pdfFileName: book.pdfFileName || `${book.title}.pdf`,
            fileSize: book.fileSize || '5 MB',
            unitPrice: Number(book.price),
            quantity: qty,
            subtotal: lineSubtotal,
          };
          updated = [...prevItems, newItem];
        }

        return updated;
      });

      showToast(`Added "${book.title}" to cart`, 'success');
    },
    [showToast]
  );

  const removeItem = useCallback(
    (bookId: string) => {
      setItems((prevItems) => {
        const target = prevItems.find((i) => i.bookId === bookId);
        const next = prevItems.filter((item) => item.bookId !== bookId);
        if (target) {
          // Never call showToast inside a setState updater (can run during render)
          Promise.resolve().then(() => {
            showToast(`Removed "${target.title}" from cart`, 'info');
          });
        }
        return next;
      });
    },
    [showToast]
  );

  const updateQuantity = useCallback((bookId: string, newQuantity: number) => {
    const validQty = Math.max(1, newQuantity);
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.bookId === bookId) {
          return {
            ...item,
            quantity: validQty,
            subtotal: Number((item.unitPrice * validQty).toFixed(2)),
          };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== 'undefined') {
      const activeKey = getStorageKey();
      localStorage.removeItem(activeKey);
    }
  }, [getStorageKey]);

  const isInCart = useCallback(
    (bookId: string) => {
      return items.some((item) => item.bookId === bookId);
    },
    [items]
  );

  const getItemQuantity = useCallback(
    (bookId: string) => {
      const item = items.find((i) => i.bookId === bookId);
      return item ? item.quantity : 0;
    },
    [items]
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
        totalItems,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
