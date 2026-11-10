import React from 'react';

const VARIANTS = {
  brand: 'bg-[#002B55] text-white font-bold',
  accent: 'bg-[#D9A521]/15 text-[#8F6A0D] border border-[#D9A521]/30 font-bold',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium'
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px] rounded-md tracking-wider uppercase',
  md: 'px-2.5 py-1 text-xs rounded-lg'
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 leading-none shrink-0 ${variantClass} ${sizeClass} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-500'
              : variant === 'warning'
              ? 'bg-amber-500'
              : variant === 'danger'
              ? 'bg-rose-500'
              : variant === 'accent'
              ? 'bg-[#D9A521]'
              : 'bg-slate-400'
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

