import React, { useState, useEffect } from 'react';
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
}