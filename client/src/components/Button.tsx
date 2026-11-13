import React from 'react';
import { cn } from '../utils/cn';

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}) => (
  <button
    type={type}
    className={cn(
      'btn',
      `btn-${['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'].includes(variant) ? variant : 'primary'}`,
      size === 'sm' && 'px-3 text-sm',
      size === 'lg' && 'min-h-12 px-6',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
export default Button;
