import React from 'react';

export function Select({
  id,
  label,
  error,
  hint,
  required = false,
  options = [],
  children,
  className = '',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = selectId ? `${selectId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-800 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-[#002B55] focus:ring-[#002B55]/20'
          } ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
        </select>
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-rose-600 mt-1 font-medium">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

