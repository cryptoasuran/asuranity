#!/usr/bin/env python3
import os

base = "src/ui/components"

# Generate comprehensive UI component library
components = {
    'ResultCard': '''import React from 'react';
import { motion } from 'framer-motion';

export default function ResultCard({ result, index }) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-4 hover:border-primary transition"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xs text-text-secondary mb-1">
            {result.network} • {new Date(result.timestamp).toLocaleTimeString()}
          </div>
          <div className="font-mono text-sm break-all">
            {result.address}
          </div>
        </div>
        
        <button
          onClick={() => copyToClipboard(result.address)}
          className="ml-3 p-2 hover:bg-white/10 rounded-lg transition"
        >
          {copied ? (
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 bg-primary/20 text-primary rounded">
          {result.pattern}
        </span>
        <span className="px-2 py-1 bg-surface rounded">
          {result.patternType}
        </span>
      </div>

      {result.privateKey && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-text-secondary hover:text-text">
            Show Private Key
          </summary>
          <div className="mt-2 p-2 bg-surface rounded font-mono text-xs break-all">
            {result.privateKey}
          </div>
        </details>
      )}
    </motion.div>
  );
}''',

    'NetworkCard': '''import React from 'react';
import { motion } from 'framer-motion';

export default function NetworkCard({ network, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-4 rounded-xl transition ${
        selected
          ? 'bg-primary text-white'
          : 'bg-surface hover:bg-surface/80'
      }`}
    >
      <div className="text-2xl mb-2">{network.icon}</div>
      <div className="text-sm font-medium">{network.name}</div>
      {network.chainId && (
        <div className="text-xs opacity-70 mt-1">
          Chain {network.chainId}
        </div>
      )}
    </motion.button>
  );
}''',

    'SettingsPanel': '''import React, { useState } from 'react';
import { useGeneratorStore } from '../../core/store/GeneratorStore';

export default function SettingsPanel() {
  const { settings, updateSettings } = useGeneratorStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Worker Threads
          </label>
          <input
            type="range"
            min="1"
            max={navigator.hardwareConcurrency || 8}
            value={localSettings.workerCount}
            onChange={(e) => handleChange('workerCount', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-text-secondary mt-1">
            {localSettings.workerCount} threads
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Batch Size
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={localSettings.batchSize}
            onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-text-secondary mt-1">
            {localSettings.batchSize} addresses per batch
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
          <span className="text-sm font-medium">Auto Save Results</span>
          <button
            onClick={() => handleChange('autoSave', !localSettings.autoSave)}
            className={`relative w-12 h-6 rounded-full transition ${
              localSettings.autoSave ? 'bg-primary' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              localSettings.autoSave ? 'translate-x-6' : ''
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
          <span className="text-sm font-medium">Notifications</span>
          <button
            onClick={() => handleChange('notifications', !localSettings.notifications)}
            className={`relative w-12 h-6 rounded-full transition ${
              localSettings.notifications ? 'bg-primary' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              localSettings.notifications ? 'translate-x-6' : ''
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
          <span className="text-sm font-medium">GPU Acceleration</span>
          <button
            onClick={() => handleChange('gpuAcceleration', !localSettings.gpuAcceleration)}
            className={`relative w-12 h-6 rounded-full transition ${
              localSettings.gpuAcceleration ? 'bg-primary' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              localSettings.gpuAcceleration ? 'translate-x-6' : ''
            }`} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Theme
          </label>
          <select
            value={localSettings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="w-full px-3 py-2 bg-surface rounded-lg border border-white/10"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>
    </div>
  );
}''',

    'PatternTypeSelector': '''import React from 'react';

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
}''',

    'WorkerStatus': '''import React from 'react';

export default function WorkerStatus({ workers }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Worker Status</h3>
      
      <div className="space-y-2">
        {workers.map((worker) => (
          <div key={worker.id} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              worker.active ? 'bg-success animate-pulse' : 'bg-gray-600'
            }`} />
            
            <div className="flex-1">
              <div className="text-xs font-medium">Worker {worker.id + 1}</div>
              <div className="text-xs text-text-secondary">
                {worker.processed.toLocaleString()} processed
              </div>
            </div>

            <div className="text-xs text-text-secondary">
              {worker.active ? 'Active' : 'Idle'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}''',

    'ProgressBar': '''import React from 'react';

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
}'''
}

for name, content in components.items():
    filepath = os.path.join(base, f'{name}.jsx')
    with open(filepath, 'w') as f:
        f.write(content)

print(f"Generated {len(components)} UI components")
