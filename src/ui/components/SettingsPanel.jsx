import React, { useState } from 'react';
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
}