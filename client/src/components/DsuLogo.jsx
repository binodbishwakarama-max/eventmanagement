import React, { useState } from 'react';

/**
 * Official Dayananda Sagar University Logo Lockup
 * Preserves exact aspect ratio (628:207, ~3.03:1) and crisp vector-like rendering across all screen densities.
 */
export function DsuLogo({ variant = 'default', size = 'md', className = '' }) {
  const isWhite = variant === 'white';
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'h-6 max-h-6',
    sm: 'h-8 max-h-8',
    md: 'h-9 sm:h-10 max-h-10',
    lg: 'h-11 sm:h-12 max-h-12',
    xl: 'h-12 sm:h-14 max-h-14'
  }[size] || 'h-9 sm:h-10 max-h-10';

  const logoSrc = isWhite ? '/dsu-logo-white.png' : '/dsu-logo.png';

  return (
    <div className={`inline-flex items-center gap-3 select-none shrink-0 ${className}`}>
      {!imgError ? (
        <img
          src={logoSrc}
          alt="Dayananda Sagar University"
          loading="eager"
          decoding="async"
          onError={() => {
            if (!isWhite) setImgError(true);
          }}
          className={`${sizeClasses} w-auto max-w-full object-contain aspect-[628/207] drop-shadow-xs transition-opacity duration-200`}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#002B55] text-[#D9A521] border border-[#D9A521]/30 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            DSU
          </div>
          <div className="flex flex-col leading-tight">
            <span className={`font-bold text-sm tracking-tight ${isWhite ? 'text-white' : 'text-[#002B55]'}`}>
              Dayananda Sagar University
            </span>
            <span className={`text-[10px] font-medium ${isWhite ? 'text-slate-300' : 'text-slate-500'}`}>
              Campus Events Portal
            </span>
          </div>
        </div>
      )}

      {variant === 'with-tag' && (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#002B55]/5 text-[#002B55] border border-[#002B55]/15 tracking-wide">
          Events
        </span>
      )}
    </div>
  );
}

export default DsuLogo;
