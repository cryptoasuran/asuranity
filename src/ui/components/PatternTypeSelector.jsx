import React from 'react';

export default function PatternTypeSelector({ value, onChange }) {
  const types = [
    { id: 'prefix', label: 'Prefix', description: 'Pattern at start' },
    { id: 'suffix', label: 'Suffix', description: 'Pattern at end' },
    { id: 'contains', label: 'Contains', description: 'Pattern anywhere' },
    { id: 'regex', label: 'Regex', description: 'Custom pattern' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => (
        <button
          key={type.id}
          onClick={() => onChange(type.id)}
          className={`p-4 rounded-xl text-left transition ${
            value === type.id
              ? 'bg-primary text-white'
              : 'bg-surface hover:bg-surface/80'
          }`}
        >
          <div className="font-medium mb-1">{type.label}</div>
          <div className="text-xs opacity-70">{type.description}</div>
        </button>
      ))}
    </div>
  );
}