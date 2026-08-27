import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, optional, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{label}</span>
            {optional && <span className="form-label-optional">Optional</span>}
          </label>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '0.875rem',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
            style={{
              paddingLeft: leftIcon ? '2.5rem' : '0.875rem',
              paddingRight: rightIcon ? '2.5rem' : '0.875rem',
            }}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '0.875rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && <span className="form-error-msg">{error}</span>}
        {hint && !error && <span className="form-hint">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
