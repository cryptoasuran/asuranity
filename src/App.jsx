import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './ui/components/Header';
import NetworkSelector from './ui/components/NetworkSelector';
import PatternInput from './ui/components/PatternInput';
import GenerationControls from './ui/components/GenerationControls';
import ResultsPanel from './ui/components/ResultsPanel';
import StatisticsPanel from './ui/components/StatisticsPanel';
import SettingsPanel from './ui/components/SettingsPanel';
import { useGeneratorStore } from './core/store/GeneratorStore';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const { isGenerating, results, statistics } = useGeneratorStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass rounded-2xl p-6 glow">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              ASURANITY
            </h1>
            <p className="text-text-secondary">
              Universal Blockchain Vanity Address Generator
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <NetworkSelector />
              <PatternInput />
              <GenerationControls />
              <ResultsPanel results={results} />
            </div>

            <div className="space-y-6">
              <StatisticsPanel statistics={statistics} />
              <SettingsPanel />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
