import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("bg-white rounded-lg border border-border shadow-card p-5", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className }) => (
  <div className={cn("flex items-center justify-between mb-4", className)}>
    <div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
