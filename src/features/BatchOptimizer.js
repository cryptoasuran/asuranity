/**
 * Batch Optimizer
 * Intelligently optimizes batch generation based on hardware capabilities
 * Dynamically adjusts worker count, batch size, and memory usage
 */
export class BatchOptimizer {
  constructor() {
    this.profile = null;
    this.history = [];
    this.currentConfig = null;
    this.metrics = {
      totalGenerated: 0,
      totalTime: 0,
      avgHashRate: 0,
      peakHashRate: 0,
      memoryUsage: []
    };

    this.constraints = {
      maxWorkers: navigator.hardwareConcurrency || 4,
      maxMemoryMB: (navigator.deviceMemory || 4) * 1024 * 0.8,
      targetCPUUsage: 0.85,
      minBatchSize: 100,
      maxBatchSize: 100000
    };
  }

  async initialize() {
    await this.profileHardware();
    this.currentConfig = this.generateInitialConfig();
  }

  async profileHardware() {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;

    // CPU benchmark
    const cpuScore = await this.benchmarkCPU();

    // Memory benchmark
    const memoryBandwidth = await this.benchmarkMemory();

    // Single-thread performance
    const singleThreadPerf = await this.benchmarkSingleThread();

    // Multi-thread scaling
    const multiThreadScaling = await this.benchmarkMultiThread();

    this.profile = {
      cores,
      memory,
      cpuScore,
      memoryBandwidth,
      singleThreadPerf,
      multiThreadScaling,
      tier: this.classifyHardware(cores, memory, cpuScore)
    };

    return this.profile;
  }

  async benchmarkCPU() {
    const iterations = 100000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      Math.random().toString(36).substring(2, 15);
    }

    const endTime = performance.now();
    return iterations / ((endTime - startTime) / 1000);
  }

  async benchmarkMemory() {
    const size = 10 * 1024 * 1024; // 10MB
    const array = new Float64Array(size / 8);

    const startTime = performance.now();

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.random();
    }

    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }

    const endTime = performance.now();
    const bandwidth = (size / 1024 / 1024) / ((endTime - startTime) / 1000);

    return bandwidth;
  }

  async benchmarkSingleThread() {
    const duration = 1000;
    const startTime = performance.now();
    let operations = 0;

    while (performance.now() - startTime < duration) {
      Math.random().toString(36).substring(2, 15);
      operations++;
    }

    return operations;
  }

  async benchmarkMultiThread() {
    const workerCounts = [1, 2, 4, 8].filter(n => n <= this.constraints.maxWorkers);
    const scaling = {};

    for (const count of workerCounts) {
      const perf = await this.testWorkerCount(count);
      scaling[count] = perf;
    }

    return scaling;
  }

  async testWorkerCount(count) {
    const iterationsPerWorker = 50000;
    const startTime = performance.now();

    const workers = [];
    for (let i = 0; i < count; i++) {
      const worker = new Worker(
        URL.createObjectURL(
          new Blob([`
            self.onmessage = (e) => {
              const iterations = e.data;
              for (let i = 0; i < iterations; i++) {
                Math.random().toString(36).substring(2, 15);
              }
              self.postMessage('done');
            };
          `], { type: 'application/javascript' })
        )
      );

      workers.push(
        new Promise(resolve => {
          worker.onmessage = () => {
            worker.terminate();
            resolve();
          };
          worker.postMessage(iterationsPerWorker);
        })
      );
    }

    await Promise.all(workers);

    const endTime = performance.now();
    const totalOps = iterationsPerWorker * count;
    const opsPerSecond = totalOps / ((endTime - startTime) / 1000);

    return opsPerSecond;
  }

  classifyHardware(cores, memory, cpuScore) {
    if (cores >= 8 && memory >= 8 && cpuScore > 500000) return 'high';
    if (cores >= 4 && memory >= 4 && cpuScore > 200000) return 'medium';
    return 'low';
  }

  generateInitialConfig() {
    if (!this.profile) {
      return {
        workerCount: 4,
        batchSize: 1000,
        memoryPerWorker: 50
      };
    }

    const { tier, cores, multiThreadScaling } = this.profile;

    // Find optimal worker count
    let optimalWorkers = cores;
    let bestEfficiency = 0;

    for (const [count, perf] of Object.entries(multiThreadScaling)) {
      const efficiency = perf / parseInt(count);
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        optimalWorkers = parseInt(count);
      }
    }

    // Calculate batch size based on tier
    let batchSize;
    switch (tier) {
      case 'high':
        batchSize = 10000;
        break;
      case 'medium':
        batchSize = 5000;
        break;
      default:
        batchSize = 1000;
    }

    return {
      workerCount: optimalWorkers,
      batchSize,
      memoryPerWorker: Math.floor(this.constraints.maxMemoryMB / optimalWorkers)
    };
  }

  async optimize(currentMetrics) {
    this.history.push({
      config: { ...this.currentConfig },
      metrics: { ...currentMetrics },
      timestamp: Date.now()
    });

    // Update global metrics
    this.metrics.totalGenerated += currentMetrics.generated || 0;
    this.metrics.totalTime += currentMetrics.elapsed || 0;
    this.metrics.avgHashRate = this.metrics.totalGenerated / this.metrics.totalTime;
    this.metrics.peakHashRate = Math.max(this.metrics.peakHashRate, currentMetrics.hashRate || 0);

    // Analyze performance
    const analysis = this.analyzePerformance();

    // Generate new config
    const newConfig = this.generateOptimizedConfig(analysis);

    // Apply changes gradually
    this.currentConfig = this.blendConfigs(this.currentConfig, newConfig, 0.3);

    return this.currentConfig;
  }

  analyzePerformance() {
    if (this.history.length < 2) {
      return { trend: 'stable', bottleneck: null };
    }

    const recent = this.history.slice(-5);
    const hashRates = recent.map(h => h.metrics.hashRate || 0);

    // Calculate trend
    const avgRecent = hashRates.reduce((a, b) => a + b, 0) / hashRates.length;
    const avgOlder = this.metrics.avgHashRate;
    const trend = avgRecent > avgOlder * 1.1 ? 'improving' :
                  avgRecent < avgOlder * 0.9 ? 'degrading' : 'stable';

    // Identify bottleneck
    let bottleneck = null;

    // Check CPU usage
    const cpuUsage = this.estimateCPUUsage();
    if (cpuUsage < 0.5) {
      bottleneck = 'underutilized_cpu';
    } else if (cpuUsage > 0.95) {
      bottleneck = 'cpu_saturated';
    }

    // Check memory
    const memoryUsage = this.estimateMemoryUsage();
    if (memoryUsage > 0.9) {
      bottleneck = 'memory_pressure';
    }

    // Check worker efficiency
    const workerEfficiency = this.calculateWorkerEfficiency();
    if (workerEfficiency < 0.7) {
      bottleneck = 'poor_scaling';
    }

    return { trend, bottleneck, cpuUsage, memoryUsage, workerEfficiency };
  }

  generateOptimizedConfig(analysis) {
    const newConfig = { ...this.currentConfig };

    switch (analysis.bottleneck) {
      case 'underutilized_cpu':
        // Increase workers or batch size
        if (newConfig.workerCount < this.constraints.maxWorkers) {
          newConfig.workerCount++;
        } else {
          newConfig.batchSize = Math.min(
            newConfig.batchSize * 1.5,
            this.constraints.maxBatchSize
          );
        }
        break;

      case 'cpu_saturated':
        // Reduce workers or batch size
        if (newConfig.batchSize > this.constraints.minBatchSize * 2) {
          newConfig.batchSize = Math.floor(newConfig.batchSize * 0.8);
        } else if (newConfig.workerCount > 2) {
          newConfig.workerCount--;
        }
        break;

      case 'memory_pressure':
        // Reduce batch size or workers
        newConfig.batchSize = Math.max(
          Math.floor(newConfig.batchSize * 0.7),
          this.constraints.minBatchSize
        );
        if (newConfig.workerCount > 2) {
          newConfig.workerCount--;
        }
        break;

      case 'poor_scaling':
        // Reduce workers, increase batch size
        if (newConfig.workerCount > 2) {
          newConfig.workerCount--;
          newConfig.batchSize = Math.min(
            newConfig.batchSize * 1.3,
            this.constraints.maxBatchSize
          );
        }
        break;

      default:
        // Stable - make small improvements
        if (analysis.trend === 'improving') {
          // Continue current direction
          newConfig.batchSize = Math.min(
            Math.floor(newConfig.batchSize * 1.1),
            this.constraints.maxBatchSize
          );
        }
    }

    return newConfig;
  }

  blendConfigs(current, target, alpha) {
    return {
      workerCount: Math.round(current.workerCount * (1 - alpha) + target.workerCount * alpha),
      batchSize: Math.round(current.batchSize * (1 - alpha) + target.batchSize * alpha),
      memoryPerWorker: Math.round(current.memoryPerWorker * (1 - alpha) + target.memoryPerWorker * alpha)
    };
  }

  estimateCPUUsage() {
    // Estimate based on worker count and performance
    if (!this.profile) return 0.5;

    const maxPerf = this.profile.multiThreadScaling[this.constraints.maxWorkers] || 1;
    const currentPerf = this.metrics.avgHashRate;

    return Math.min(currentPerf / maxPerf, 1.0);
  }

  estimateMemoryUsage() {
    // Estimate based on worker count and batch size
    const estimatedMB = this.currentConfig.workerCount * this.currentConfig.batchSize * 0.001;
    return estimatedMB / this.constraints.maxMemoryMB;
  }

  calculateWorkerEfficiency() {
    if (!this.profile || !this.profile.multiThreadScaling) return 1.0;

    const singleThreadPerf = this.profile.multiThreadScaling[1] || 1;
    const currentPerf = this.metrics.avgHashRate;
    const idealPerf = singleThreadPerf * this.currentConfig.workerCount;

    return currentPerf / idealPerf;
  }

  getRecommendations() {
    const analysis = this.analyzePerformance();
    const recommendations = [];

    if (analysis.bottleneck === 'underutilized_cpu') {
      recommendations.push({
        type: 'performance',
        message: 'CPU is underutilized. Consider increasing worker count or batch size.',
        action: 'increase_workers'
      });
    }

    if (analysis.bottleneck === 'memory_pressure') {
      recommendations.push({
        type: 'warning',
        message: 'High memory usage detected. Reducing batch size to prevent crashes.',
        action: 'reduce_batch'
      });
    }

    if (analysis.workerEfficiency < 0.7) {
      recommendations.push({
        type: 'info',
        message: 'Poor multi-threading efficiency. Fewer workers with larger batches may perform better.',
        action: 'optimize_scaling'
      });
    }

    return recommendations;
  }

  getOptimizationReport() {
    return {
      profile: this.profile,
      currentConfig: this.currentConfig,
      metrics: this.metrics,
      analysis: this.analyzePerformance(),
      recommendations: this.getRecommendations(),
      history: this.history.slice(-10)
    };
  }

  reset() {
    this.history = [];
    this.metrics = {
      totalGenerated: 0,
      totalTime: 0,
      avgHashRate: 0,
      peakHashRate: 0,
      memoryUsage: []
    };
    this.currentConfig = this.generateInitialConfig();
  }
}

export default BatchOptimizer;
