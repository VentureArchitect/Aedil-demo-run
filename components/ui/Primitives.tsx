import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string, glow?: boolean }> = ({ children, className = "", glow = false }) => (
  <div className={`
    relative rounded-xl border border-white/10 bg-[#151621] p-5 
    ${glow ? 'shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)] border-amber-500/20' : ''}
    ${className}
  `}>
    {children}
  </div>
);

export const Badge: React.FC<{ type: 'warning' | 'success' | 'neutral' | 'error', children: React.ReactNode }> = ({ type, children }) => {
  const styles = {
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    neutral: "bg-slate-700/30 text-slate-400 border-slate-600/30"
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-mono border ${styles[type] || styles.neutral} uppercase tracking-wider`}>
      {children}
    </span>
  );
};