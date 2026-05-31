import React from 'react';

export default function ProgressBar({ current, target, label }) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-2">
          <span>{label}</span>
          <span className="text-text-secondary">
            {current.toLocaleString()} / {target.toLocaleString()}
          </span>
        </div>
      )}
      
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="text-xs text-text-secondary mt-1 text-right">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
}