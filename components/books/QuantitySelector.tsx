import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
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
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-base)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        style={{
          width: isSm ? '28px' : '36px',
          height: isSm ? '28px' : '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: quantity <= min ? 'var(--text-light)' : 'var(--text-primary)',
          backgroundColor: 'transparent',
          transition: 'background-color var(--transition-fast)',
        }}
        aria-label="Decrease quantity"
      >
        <Minus size={isSm ? 12 : 16} />
      </button>

      <span
        style={{
          minWidth: isSm ? '24px' : '36px',
          textAlign: 'center',
          fontSize: isSm ? '0.8125rem' : '0.9375rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          userSelect: 'none',
        }}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        style={{
          width: isSm ? '28px' : '36px',
          height: isSm ? '28px' : '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: quantity >= max ? 'var(--text-light)' : 'var(--text-primary)',
          backgroundColor: 'transparent',
          transition: 'background-color var(--transition-fast)',
        }}
        aria-label="Increase quantity"
      >
        <Plus size={isSm ? 12 : 16} />
      </button>
    </div>
  );
};
