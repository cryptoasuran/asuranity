import React from 'react';
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
}