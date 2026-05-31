import React from 'react';
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
}