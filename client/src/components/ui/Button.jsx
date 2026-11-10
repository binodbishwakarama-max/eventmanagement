import React from 'react';

const VARIANTS = {
  primary:
    'bg-[#002B55] hover:bg-[#001B36] text-white shadow-xs focus-visible:ring-[#002B55] active:scale-[0.98]',
  secondary:
    'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs focus-visible:ring-slate-400 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-300',
  destructive:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-600 active:scale-[0.98]',
  gold:
    'bg-[#D9A521] hover:bg-[#C2921A] text-slate-950 font-bold shadow-xs focus-visible:ring-[#D9A521] active:scale-[0.98]'
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-xl min-h-[48px]'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}

