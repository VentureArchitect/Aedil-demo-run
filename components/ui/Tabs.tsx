import React from 'react';

// Minimal Tab implementation for cleaner code structure in parent
export const Tabs = ({ children, value, onValueChange, className }: any) => {
  return <div className={className}>{children}</div>;
};

export const TabsList = ({ children, className }: any) => (
  <div className={`flex ${className}`}>{children}</div>
);

export const TabsTrigger = ({ value, onClick, active, children, disabled, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${className} ${active ? 'text-accent-primary border-b-2 border-accent-primary' : 'text-text-tertiary hover:text-text-secondary'}`}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, active, children }: any) => {
  if (!active) return null;
  return <div>{children}</div>;
};