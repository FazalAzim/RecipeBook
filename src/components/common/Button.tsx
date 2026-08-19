import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline-primary',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  }[variant];

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }[size];

  const fullWidthClass = fullWidth ? 'btn-full' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg
            style={{ animation: 'spin 1s linear infinite', width: '1.125rem', height: '1.125rem' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
