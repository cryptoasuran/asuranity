import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGeneratorStore = create(
  persist(
    (set, get) => ({
      // Generation state
      isGenerating: false,
      isPaused: false,
      selectedNetwork: 'ethereum',
      pattern: '',
      patternType: 'prefix',
      caseSensitive: false,

      // Results
      results: [],
      totalGenerated: 0,
      totalChecked: 0,

      // Statistics
      statistics: {
        hashRate: 0,
        elapsedTime: 0,
        estimatedTime: 0,
        difficulty: 0,
        probability: 0
      },

      // Settings
      settings: {
        workerCount: navigator.hardwareConcurrency || 4,
        batchSize: 1000,
        autoSave: true,
        theme: 'dark',
        notifications: true,
        gpuAcceleration: false
      },

      // Actions
      setNetwork: (network) => set({ selectedNetwork: network }),
      setPattern: (pattern) => set({ pattern }),
      setPatternType: (type) => set({ patternType: type }),
      setCaseSensitive: (value) => set({ caseSensitive: value }),

      startGeneration: () => set({ isGenerating: true, isPaused: false }),
      pauseGeneration: () => set({ isPaused: true }),
      stopGeneration: () => set({ isGenerating: false, isPaused: false }),

      addResult: (result) => set((state) => ({
        results: [result, ...state.results].slice(0, 100)
      })),

      updateStatistics: (stats) => set((state) => ({
        statistics: { ...state.statistics, ...stats }
      })),

      incrementChecked: (count) => set((state) => ({
        totalChecked: state.totalChecked + count
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      clearResults: () => set({ results: [], totalGenerated: 0, totalChecked: 0 }),

      reset: () => set({
        isGenerating: false,
        isPaused: false,
        results: [],
        totalGenerated: 0,
        totalChecked: 0,
        statistics: {
          hashRate: 0,
          elapsedTime: 0,
          estimatedTime: 0,
          difficulty: 0,
          probability: 0
        }
      })
    }),
    {
      name: 'asuranity-storage',
      partialize: (state) => ({
        selectedNetwork: state.selectedNetwork,
        settings: state.settings,
        results: state.results.slice(0, 10)
      })
    }
  )
);
