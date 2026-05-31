import React from 'react';

export default function WorkerStatus({ workers }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Worker Status</h3>
      
      <div className="space-y-2">
        {workers.map((worker) => (
          <div key={worker.id} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              worker.active ? 'bg-success animate-pulse' : 'bg-gray-600'
            }`} />
            
            <div className="flex-1">
              <div className="text-xs font-medium">Worker {worker.id + 1}</div>
              <div className="text-xs text-text-secondary">
                {worker.processed.toLocaleString()} processed
              </div>
            </div>

            <div className="text-xs text-text-secondary">
              {worker.active ? 'Active' : 'Idle'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}