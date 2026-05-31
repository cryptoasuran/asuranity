import React, { useState } from 'react';
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
}