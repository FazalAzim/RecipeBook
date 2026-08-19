import React, { type ReactNode, type CSSProperties } from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'pdf' | 'success' | 'neutral' | 'amber';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  style,
}) => {
  const variantClass = {
    primary: 'badge-primary',
    pdf: 'badge-pdf',
    success: 'badge-success',
    neutral: 'badge-neutral',
    amber: 'badge-amber',
  }[variant];

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} style={style}>
      {icon && <span style={{ display: 'inline-flex', fontSize: '0.9em' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
