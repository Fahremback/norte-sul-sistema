import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  colorClass?: string; // e.g., 'border-blue-500'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, colorClass = 'border-green-600' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2 my-4">
      <div
        className={`${sizeClasses[size]} ${colorClass} border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-live="polite"
        aria-label={text || "Carregando"}
      ></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;