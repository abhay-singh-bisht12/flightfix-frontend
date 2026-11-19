import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-blue-500 border-t-transparent animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-xs text-slate-400 font-medium">{text}</p>}
    </div>
  );
}
