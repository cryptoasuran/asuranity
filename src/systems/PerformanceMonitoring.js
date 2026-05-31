/**
 * Performance Monitoring System
 * Real-time performance tracking and optimization
 */
export class PerformanceMonitoring {
  constructor() {
    this.metrics = [];
    this.observers = [];
    this.thresholds = {
      fps: 30,
      memory: 500 * 1024 * 1024,
      loadTime: 3000
    };

    this.startMonitoring();
  }

  startMonitoring() {
    this.monitorFPS();
    this.monitorMemory();
    this.monitorNetwork();
    this.monitorUserTiming();
  }

  monitorFPS() {
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));

        this.recordMetric('fps', fps);

        if (fps < this.thresholds.fps) {
          this.triggerAlert('fps', fps);
        }

        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  monitorMemory() {
    if (!performance.memory) return;

    setInterval(() => {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;

      this.recordMetric('memory', {
        used,
        total,
        limit,
        percentage: (used / limit) * 100
      });

      if (used > this.thresholds.memory) {
        this.triggerAlert('memory', used);
      }
    }, 5000);
  }

  monitorNetwork() {
    if (!performance.getEntriesByType) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.recordMetric('network', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  monitorUserTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('timing', {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);
  }

  recordMetric(type, value) {
    this.metrics.push({
      type,
      value,
      timestamp: Date.now()
    });

    if (this.metrics.length > 10000) {
      this.metrics.shift();
    }
  }

  triggerAlert(type, value) {
    console.warn(`Performance alert: ${type} = ${value}`);
  }

  mark(name) {
    performance.mark(name);
  }

  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark);
  }

  getMetrics(type, duration = 60000) {
    const cutoff = Date.now() - duration;
    return this.metrics.filter(m =>
      m.timestamp >= cutoff &&
      (!type || m.type === type)
    );
  }

  getAverages() {
    const fps = this.getMetrics('fps', 10000);
    const avgFPS = fps.length > 0
      ? fps.reduce((sum, m) => sum + m.value, 0) / fps.length
      : 0;

    return {
      fps: avgFPS,
      memory: this.getCurrentMemory(),
      timestamp: Date.now()
    };
  }

  getCurrentMemory() {
    if (!performance.memory) return null;

    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
    };
  }

  stopMonitoring() {
    for (const observer of this.observers) {
      observer.disconnect();
    }
    this.observers = [];
  }
}

export default PerformanceMonitoring;
