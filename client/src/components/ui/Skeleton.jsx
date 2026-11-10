import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

