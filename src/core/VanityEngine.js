export class VanityEngine {
  constructor(config = {}) {
    this.config = {
      workerCount: config.workerCount || navigator.hardwareConcurrency || 4,
      batchSize: config.batchSize || 1000,
      checkInterval: config.checkInterval || 100,
      maxResults: config.maxResults || 1,
      ...config
    };

    this.workers = [];
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.totalChecked = 0;
    this.results = [];

    this.callbacks = {
      onResult: null,
      onProgress: null,
      onComplete: null,
      onError: null
    };
  }

  async initialize() {
    this.workers = [];

    for (let i = 0; i < this.config.workerCount; i++) {
      const worker = new Worker(
        new URL('../workers/GeneratorWorker.js', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (e) => this.handleWorkerMessage(e, i);
      worker.onerror = (e) => this.handleWorkerError(e, i);

      this.workers.push({
        worker,
        id: i,
        active: false,
        checked: 0
      });
    }
  }

  async start(network, pattern, options = {}) {
    if (this.isRunning) {
      throw new Error('Generator already running');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.totalChecked = 0;
    this.results = [];

    const config = {
      network,
      pattern,
      patternType: options.patternType || 'prefix',
      caseSensitive: options.caseSensitive || false,
      batchSize: this.config.batchSize
    };

    for (const workerData of this.workers) {
      workerData.active = true;
      workerData.worker.postMessage({
        type: 'start',
        config
      });
    }

    this.startProgressMonitoring();
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;

    for (const workerData of this.workers) {
      workerData.worker.postMessage({ type: 'pause' });
    }
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;

    for (const workerData of this.workers) {
      workerData.worker.postMessage({ type: 'resume' });
    }
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isPaused = false;

    for (const workerData of this.workers) {
      workerData.active = false;
      workerData.worker.postMessage({ type: 'stop' });
    }

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(this.results);
    }
  }

  handleWorkerMessage(event, workerId) {
    const { type, data } = event.data;

    switch (type) {
      case 'result':
        this.handleResult(data);
        break;

      case 'progress':
        this.handleProgress(workerId, data);
        break;

      case 'error':
        this.handleError(data);
        break;
    }
  }

  handleResult(result) {
    this.results.push(result);

    if (this.callbacks.onResult) {
      this.callbacks.onResult(result);
    }

    if (this.results.length >= this.config.maxResults) {
      this.stop();
    }
  }

  handleProgress(workerId, data) {
    this.workers[workerId].checked = data.checked;
    this.totalChecked = this.workers.reduce((sum, w) => sum + w.checked, 0);
  }

  handleError(error) {
    console.error('Worker error:', error);

    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  handleWorkerError(error, workerId) {
    console.error(`Worker ${workerId} error:`, error);
    this.handleError(error);
  }

  startProgressMonitoring() {
    this.progressInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;

      const elapsed = (Date.now() - this.startTime) / 1000;
      const hashRate = this.totalChecked / elapsed;

      if (this.callbacks.onProgress) {
        this.callbacks.onProgress({
          totalChecked: this.totalChecked,
          hashRate,
          elapsed,
          results: this.results.length
        });
      }
    }, this.config.checkInterval);
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }

  getStatistics() {
    const elapsed = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    const hashRate = elapsed > 0 ? this.totalChecked / elapsed : 0;

    return {
      totalChecked: this.totalChecked,
      hashRate,
      elapsed,
      results: this.results.length,
      workers: this.workers.length,
      isRunning: this.isRunning,
      isPaused: this.isPaused
    };
  }

  destroy() {
    this.stop();

    for (const workerData of this.workers) {
      workerData.worker.terminate();
    }

    this.workers = [];
  }
}

export default VanityEngine;
