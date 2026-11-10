import React, { useState } from 'react';

export function DsuLogo({ variant = 'default', size = 'md', className = '' }) {
  const isWhite = variant === 'white';
  const [imgError, setImgError] = useState(false);

  // Responsive authentic logo dimensions
  const heightClass =
    size === 'sm'
      ? 'h-8 sm:h-9'
      : size === 'lg'
      ? 'h-11 sm:h-12'
      : size === 'xl'
      ? 'h-12 sm:h-14'
      : 'h-9 sm:h-10';

  const logoSrc = isWhite ? '/dsu-logo-white.png' : '/dsu-logo.png';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {!imgError ? (
        <img
          src={logoSrc}
          alt="Dayananda Sagar University"
          onError={() => {
            if (isWhite) {
              setImgError(false);
            } else {
              setImgError(true);
            }
          }}
          className={`${heightClass} w-auto object-contain max-w-full`}
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#002B55] text-[#D9A521] border border-[#D9A521]/30 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            DSU
          </div>
          <div className="flex flex-col leading-tight">
            <span className={`font-extrabold text-sm tracking-tight ${isWhite ? 'text-white' : 'text-[#002B55]'}`}>
              Dayananda Sagar University
            </span>
            <span className={`text-[10px] font-medium ${isWhite ? 'text-slate-300' : 'text-slate-500'}`}>
              Harohalli Main Campus, Bengaluru
            </span>
          </div>
        </div>
      )}

      {/* Subtitle badge for events portal */}
      {variant === 'with-tag' && (
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#002B55]/5 text-[#002B55] border border-[#002B55]/15">
          Campus Events
        </span>
      )}
    </div>
  );
}
