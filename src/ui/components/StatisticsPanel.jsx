import React, { useEffect, useState } from 'react';
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
}