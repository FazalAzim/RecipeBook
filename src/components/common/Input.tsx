import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  optional,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 8)}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{label}</span>
          {optional && <span className="form-label-optional">(Optional)</span>}
        </label>
      )}
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {leftIcon && (
          <span style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`form-input ${error ? 'form-input-error' : ''} ${className}`.trim()}
          style={{
            paddingLeft: leftIcon ? '2.5rem' : '0.875rem',
            paddingRight: rightIcon ? '2.5rem' : '0.875rem',
          }}
          {...props}
        />

        {rightIcon && (
          <span style={{ position: 'absolute', right: '0.875rem', color: 'var(--text-muted)', display: 'flex' }}>
            {rightIcon}
          </span>
        )}
      </div>

      {error && <span className="form-error-msg">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
