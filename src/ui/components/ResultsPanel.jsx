import React, { useState } from 'react';
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
}