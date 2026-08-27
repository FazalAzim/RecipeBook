import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'pdf' | 'success' | 'neutral' | 'amber';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = '',
  style,
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
