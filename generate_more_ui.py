#!/usr/bin/env python3
import os

base = "src/ui/components"

# Generate comprehensive UI components with substantial code
components = {
    'GenerationControls': '''import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGeneratorStore } from '../../core/store/GeneratorStore';
import { VanityEngine } from '../../core/VanityEngine';

export default function GenerationControls() {
  const [engine, setEngine] = useState(null);
  const { 
    isGenerating, 
    isPaused,
    selectedNetwork, 
    pattern, 
    patternType,
    caseSensitive,
    settings,
    startGeneration,
    pauseGeneration,
    stopGeneration,
    addResult,
    updateStatistics,
    incrementChecked
  } = useGeneratorStore();

  useEffect(() => {
    const vanityEngine = new VanityEngine({
      workerCount: settings.workerCount,
      batchSize: settings.batchSize
    });

    vanityEngine.on('result', (result) => {
      addResult(result);
    });

    vanityEngine.on('progress', (progress) => {
      updateStatistics(progress);
      incrementChecked(progress.totalChecked);
    });

    setEngine(vanityEngine);

    return () => {
      vanityEngine.destroy();
    };
  }, [settings.workerCount, settings.batchSize]);

  const handleStart = async () => {
    if (!pattern) {
      alert('Please enter a pattern');
      return;
    }

    startGeneration();

    try {
      await engine.start(selectedNetwork, pattern, {
        patternType,
        caseSensitive
      });
    } catch (error) {
      console.error('Generation error:', error);
      stopGeneration();
    }
  };

  const handlePause = () => {
    if (isPaused) {
      engine.resume();
    } else {
      engine.pause();
    }
    pauseGeneration();
  };

  const handleStop = () => {
    engine.stop();
    stopGeneration();
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Generation Controls</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-surface rounded-xl">
            <div className="text-sm text-text-secondary mb-1">Worker Threads</div>
            <div className="text-2xl font-bold">{settings.workerCount}</div>
          </div>

          <div className="p-4 bg-surface rounded-xl">
            <div className="text-sm text-text-secondary mb-1">Batch Size</div>
            <div className="text-2xl font-bold">{settings.batchSize}</div>
          </div>
        </div>

        <div className="flex gap-3">
          {!isGenerating ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Start Generation</span>
              </div>
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePause}
                className="flex-1 px-6 py-4 bg-warning text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStop}
                className="flex-1 px-6 py-4 bg-error text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  <span>Stop</span>
                </div>
              </motion.button>
            </>
          )}
        </div>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-primary/10 border border-primary/20 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              <span className="text-sm font-medium">
                {isPaused ? 'Generation Paused' : 'Generating addresses...'}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}''',

    'ResultsPanel': '''import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResultCard from './ResultCard';

export default function ResultsPanel({ results }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.network === filter;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.timestamp - a.timestamp;
      case 'oldest':
        return a.timestamp - b.timestamp;
      case 'address':
        return a.address.localeCompare(b.address);
      default:
        return 0;
    }
  });

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Results ({results.length})</h2>

        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-surface rounded-lg text-sm border border-white/10 focus:border-primary focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="address">By Address</option>
          </select>

          <button className="p-2 hover:bg-white/10 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {sortedResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-text-secondary">No results yet</p>
              <p className="text-sm text-text-secondary mt-1">Start generation to find vanity addresses</p>
            </motion.div>
          ) : (
            sortedResults.map((result, index) => (
              <ResultCard key={result.address + index} result={result} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}''',

    'StatisticsPanel': '''import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StatisticsPanel({ statistics }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (statistics.hashRate > 0) {
      setChartData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString(),
          hashRate: Math.round(statistics.hashRate)
        }];
        return newData.slice(-20);
      });
    }
  }, [statistics.hashRate]);

  const formatHashRate = (rate) => {
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(2)}M H/s`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(2)}K H/s`;
    return `${rate.toFixed(0)} H/s`;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Statistics</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-surface rounded-xl">
            <div className="text-xs text-text-secondary mb-1">Hash Rate</div>
            <div className="text-xl font-bold text-primary">
              {formatHashRate(statistics.hashRate)}
            </div>
          </div>

          <div className="p-4 bg-surface rounded-xl">
            <div className="text-xs text-text-secondary mb-1">Elapsed Time</div>
            <div className="text-xl font-bold text-accent">
              {formatTime(statistics.elapsedTime)}
            </div>
          </div>

          <div className="p-4 bg-surface rounded-xl">
            <div className="text-xs text-text-secondary mb-1">Difficulty</div>
            <div className="text-xl font-bold text-warning">
              {statistics.difficulty.toExponential(2)}
            </div>
          </div>

          <div className="p-4 bg-surface rounded-xl">
            <div className="text-xs text-text-secondary mb-1">Probability</div>
            <div className="text-xl font-bold text-success">
              {(statistics.probability * 100).toFixed(6)}%
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="p-4 bg-surface rounded-xl">
            <div className="text-sm font-medium mb-3">Hash Rate History</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hashRate"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl">
          <div className="text-sm font-medium mb-2">Estimated Time</div>
          <div className="text-2xl font-bold">
            {statistics.estimatedTime > 0 
              ? formatTime(statistics.estimatedTime)
              : 'Calculating...'}
          </div>
        </div>
      </div>
    </div>
  );
}'''
}

for name, content in components.items():
    filepath = os.path.join(base, f'{name}.jsx')
    with open(filepath, 'w') as f:
        f.write(content)

print(f"Generated {len(components)} advanced UI components")
