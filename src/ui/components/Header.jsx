import React from 'react';
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
}