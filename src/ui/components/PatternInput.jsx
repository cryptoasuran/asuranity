import React, { useState } from 'react';
import { useGeneratorStore } from '../../core/store/GeneratorStore';
import { PatternMatcher } from '../../core/PatternMatcher';

export default function PatternInput() {
  const { pattern, setPattern, patternType, setPatternType, caseSensitive, setCaseSensitive } = useGeneratorStore();
  const [error, setError] = useState('');

  const handlePatternChange = (value) => {
    setPattern(value);
    const validation = PatternMatcher.validatePattern(value, patternType);
    setError(validation.valid ? '' : validation.error);
  };

  const difficulty = pattern ? PatternMatcher.estimateDifficulty(pattern, patternType, caseSensitive) : 0;

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Pattern Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Pattern</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => handlePatternChange(e.target.value)}
            placeholder="Enter pattern (e.g., abc123)"
            className="w-full px-4 py-3 bg-surface rounded-xl border border-white/10 focus:border-primary focus:outline-none transition"
          />
          {error && (
            <p className="mt-2 text-sm text-error">{error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Pattern Type</label>
          <div className="grid grid-cols-3 gap-2">
            {['prefix', 'suffix', 'contains'].map((type) => (
              <button
                key={type}
                onClick={() => setPatternType(type)}
                className={`px-4 py-2 rounded-lg transition ${
                  patternType === type
                    ? 'bg-primary text-white'
                    : 'bg-surface hover:bg-surface/80'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
          <span className="text-sm font-medium">Case Sensitive</span>
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`relative w-12 h-6 rounded-full transition ${
              caseSensitive ? 'bg-primary' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              caseSensitive ? 'translate-x-6' : ''
            }`} />
          </button>
        </div>

        {difficulty > 0 && (
          <div className="p-4 bg-surface rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span>Estimated Difficulty</span>
              <span className="font-mono">{difficulty.toExponential(2)}</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${Math.min(100, Math.log10(difficulty) * 10)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}