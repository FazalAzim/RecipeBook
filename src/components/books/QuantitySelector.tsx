import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  const handleDecrement = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-subtle)',
        border: '1.5px solid var(--border-base)',
        borderRadius: 'var(--radius-md)',
        padding: isSm ? '2px 4px' : '4px 6px',
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        style={{
          width: isSm ? '24px' : '32px',
          height: isSm ? '24px' : '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface)',
          color: quantity <= min ? 'var(--text-light)' : 'var(--text-primary)',
          boxShadow: 'var(--shadow-xs)',
          cursor: quantity <= min ? 'not-allowed' : 'pointer',
        }}
        aria-label="Decrease quantity"
      >
        <Minus size={isSm ? 12 : 16} />
      </button>

      <span
        style={{
          minWidth: isSm ? '28px' : '40px',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: isSm ? '0.875rem' : '1rem',
          color: 'var(--text-primary)',
        }}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        style={{
          width: isSm ? '24px' : '32px',
          height: isSm ? '24px' : '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface)',
          color: quantity >= max ? 'var(--text-light)' : 'var(--text-primary)',
          boxShadow: 'var(--shadow-xs)',
          cursor: quantity >= max ? 'not-allowed' : 'pointer',
        }}
        aria-label="Increase quantity"
      >
        <Plus size={isSm ? 12 : 16} />
      </button>
    </div>
  );
};
