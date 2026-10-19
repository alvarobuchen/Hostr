'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'default', size = 'md', className = '', children, ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    default: 'btn btn-ghost',
    outline: 'btn btn-ghost',
    primary: 'btn btn-primary',
    ghost:   'btn btn-ghost',
  };
  const sizes: Record<string, string> = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
