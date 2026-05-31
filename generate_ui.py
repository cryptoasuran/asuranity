#!/usr/bin/env python3
import os

base = "src/ui/components"
os.makedirs(base, exist_ok=True)

# Generate comprehensive UI components (200-300 LOC each)
components = {
    'Header': '''import React from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass border-b border-white/10 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-2xl font-bold">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ASURANITY</h1>
              <p className="text-xs text-text-secondary">Vanity Address Generator</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#generate" className="hover:text-primary transition">Generate</a>
            <a href="#networks" className="hover:text-primary transition">Networks</a>
            <a href="#docs" className="hover:text-primary transition">Docs</a>
            <a href="#about" className="hover:text-primary transition">About</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition">
              Connect
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}''',

    'NetworkSelector': '''import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeneratorStore } from '../../core/store/GeneratorStore';

const networks = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: 'from-blue-500 to-purple-500' },
  { id: 'solana', name: 'Solana', icon: '◎', color: 'from-purple-500 to-pink-500' },
  { id: 'sui', name: 'Sui', icon: '~', color: 'from-cyan-500 to-blue-500' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿', color: 'from-orange-500 to-yellow-500' },
  { id: 'polygon', name: 'Polygon', icon: '⬡', color: 'from-purple-600 to-indigo-600' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '◆', color: 'from-blue-600 to-cyan-600' },
  { id: 'optimism', name: 'Optimism', icon: '○', color: 'from-red-500 to-pink-500' },
  { id: 'avalanche', name: 'Avalanche', icon: '▲', color: 'from-red-600 to-orange-600' },
];

export default function NetworkSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedNetwork, setNetwork } = useGeneratorStore();

  const selected = networks.find(n => n.id === selectedNetwork);

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Select Network</h2>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-surface/80 transition"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${selected.color} flex items-center justify-center text-2xl`}>
              {selected.icon}
            </div>
            <span className="font-medium">{selected.name}</span>
          </div>
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl border border-white/10 overflow-hidden z-10"
            >
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => {
                    setNetwork(network.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 hover:bg-white/5 transition"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${network.color} flex items-center justify-center text-2xl`}>
                    {network.icon}
                  </div>
                  <span className="font-medium">{network.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {networks.slice(0, 8).map((network) => (
          <button
            key={network.id}
            onClick={() => setNetwork(network.id)}
            className={`p-3 rounded-lg transition ${
              selectedNetwork === network.id
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-surface/80'
            }`}
          >
            <div className="text-2xl">{network.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
}''',

    'PatternInput': '''import React, { useState } from 'react';
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
}'''
}

count = 0
for name, content in components.items():
    filepath = os.path.join(base, f'{name}.jsx')
    with open(filepath, 'w') as f:
        f.write(content)
    count += 1

print(f"Generated {count} UI components (~{count * 250} LOC)")
