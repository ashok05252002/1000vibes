import React from 'react';
import { cn } from '../../lib/utils';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-white text-text-primary border border-border hover:bg-gray-50 shadow-sm",
    danger: "bg-accent text-white hover:bg-red-600 shadow-sm",
    ghost: "bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-primary",
    link: "text-primary hover:underline p-0 h-auto",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-2 flex items-center justify-center",
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className={cn("w-4 h-4", children ? "mr-2" : "")} />}
      {children}
    </button>
  );
};
