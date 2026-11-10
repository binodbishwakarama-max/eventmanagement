import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while communicating with the university servers.',
  onRetry = null,
  retryLabel = 'Try Again',
  className = ''
}) {
  return (
    <div
      className={`rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-950 leading-snug">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-800/80 mt-1.5 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

