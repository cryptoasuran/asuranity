/**
 * Analytics & Monitoring System
 * Comprehensive analytics for generation performance, user behavior, and system health
 */
export class AnalyticsSystem {
  constructor() {
    this.events = [];
    this.sessions = new Map();
    this.metrics = {
      generation: {
        total: 0,
        successful: 0,
        failed: 0,
        avgTime: 0,
        avgHashRate: 0
      },
      patterns: new Map(),
      networks: new Map(),
      performance: [],
      errors: []
    };

    this.currentSession = this.createSession();
    this.startMonitoring();
  }

  createSession() {
    const sessionId = this.generateId();
    const session = {
      id: sessionId,
      startTime: Date.now(),
      endTime: null,
      events: [],
      metrics: {
        generations: 0,
        patterns: new Set(),
        networks: new Set(),
        totalTime: 0
      },
      device: this.getDeviceInfo(),
      browser: this.getBrowserInfo()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  trackEvent(category, action, label, value) {
    const event = {
      id: this.generateId(),
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.currentSession.id
    };

    this.events.push(event);
    this.currentSession.events.push(event);

    // Update metrics
    this.updateMetrics(event);

    // Store in localStorage
    this.persistEvent(event);

    return event;
  }

  trackGeneration(pattern, network, result) {
    this.metrics.generation.total++;

    if (result.success) {
      this.metrics.generation.successful++;
    } else {
      this.metrics.generation.failed++;
    }

    // Track pattern usage
    const patternKey = `${pattern}:${result.type}`;
    const patternStats = this.metrics.patterns.get(patternKey) || {
      pattern,
      type: result.type,
      attempts: 0,
      successes: 0,
      totalTime: 0,
      avgTime: 0
    };

    patternStats.attempts++;
    if (result.success) patternStats.successes++;
    patternStats.totalTime += result.elapsed || 0;
    patternStats.avgTime = patternStats.totalTime / patternStats.attempts;

    this.metrics.patterns.set(patternKey, patternStats);

    // Track network usage
    const networkStats = this.metrics.networks.get(network) || {
      network,
      generations: 0,
      successes: 0,
      totalTime: 0
    };

    networkStats.generations++;
    if (result.success) networkStats.successes++;
    networkStats.totalTime += result.elapsed || 0;

    this.metrics.networks.set(network, networkStats);

    // Track event
    this.trackEvent('generation', result.success ? 'success' : 'failure', network, result.elapsed);

    // Update session
    this.currentSession.metrics.generations++;
    this.currentSession.metrics.patterns.add(pattern);
    this.currentSession.metrics.networks.add(network);
    this.currentSession.metrics.totalTime += result.elapsed || 0;
  }

  trackPerformance(metrics) {
    const perfData = {
      timestamp: Date.now(),
      hashRate: metrics.hashRate || 0,
      cpuUsage: metrics.cpuUsage || 0,
      memoryUsage: metrics.memoryUsage || 0,
      workerCount: metrics.workerCount || 0,
      batchSize: metrics.batchSize || 0
    };

    this.metrics.performance.push(perfData);

    // Keep last 1000 entries
    if (this.metrics.performance.length > 1000) {
      this.metrics.performance.shift();
    }

    // Calculate averages
    this.metrics.generation.avgHashRate = this.calculateAverage(
      this.metrics.performance.map(p => p.hashRate)
    );
  }

  trackError(error, context) {
    const errorData = {
      id: this.generateId(),
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      device: this.getDeviceInfo(),
      browser: this.getBrowserInfo()
    };

    this.metrics.errors.push(errorData);

    // Keep last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }

    this.trackEvent('error', error.name, error.message, 1);
  }

  updateMetrics(event) {
    // Update generation averages
    if (event.category === 'generation' && event.value) {
      const times = this.events
        .filter(e => e.category === 'generation' && e.value)
        .map(e => e.value);

      this.metrics.generation.avgTime = this.calculateAverage(times);
    }
  }

  getAnalytics() {
    return {
      sessions: Array.from(this.sessions.values()),
      currentSession: this.currentSession,
      metrics: {
        ...this.metrics,
        patterns: Array.from(this.metrics.patterns.values()),
        networks: Array.from(this.metrics.networks.values())
      },
      events: this.events.slice(-100),
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const totalSessions = this.sessions.size;
    const totalEvents = this.events.length;
    const totalGenerations = this.metrics.generation.total;
    const successRate = totalGenerations > 0
      ? (this.metrics.generation.successful / totalGenerations) * 100
      : 0;

    // Most popular patterns
    const popularPatterns = Array.from(this.metrics.patterns.values())
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5);

    // Most used networks
    const popularNetworks = Array.from(this.metrics.networks.values())
      .sort((a, b) => b.generations - a.generations)
      .slice(0, 5);

    // Performance trends
    const recentPerf = this.metrics.performance.slice(-100);
    const avgHashRate = this.calculateAverage(recentPerf.map(p => p.hashRate));
    const peakHashRate = Math.max(...recentPerf.map(p => p.hashRate));

    return {
      totalSessions,
      totalEvents,
      totalGenerations,
      successRate,
      popularPatterns,
      popularNetworks,
      performance: {
        avgHashRate,
        peakHashRate,
        avgTime: this.metrics.generation.avgTime
      }
    };
  }

  getPatternInsights(pattern) {
    const patternStats = Array.from(this.metrics.patterns.values())
      .filter(p => p.pattern === pattern);

    if (patternStats.length === 0) {
      return null;
    }

    const totalAttempts = patternStats.reduce((sum, p) => sum + p.attempts, 0);
    const totalSuccesses = patternStats.reduce((sum, p) => sum + p.successes, 0);
    const avgTime = this.calculateAverage(patternStats.map(p => p.avgTime));

    return {
      pattern,
      totalAttempts,
      totalSuccesses,
      successRate: (totalSuccesses / totalAttempts) * 100,
      avgTime,
      byType: patternStats
    };
  }

  getNetworkInsights(network) {
    const networkStats = this.metrics.networks.get(network);

    if (!networkStats) {
      return null;
    }

    const successRate = (networkStats.successes / networkStats.generations) * 100;
    const avgTime = networkStats.totalTime / networkStats.generations;

    return {
      network,
      generations: networkStats.generations,
      successes: networkStats.successes,
      successRate,
      avgTime
    };
  }

  getPerformanceTrends(duration = 3600000) {
    const cutoff = Date.now() - duration;
    const recentPerf = this.metrics.performance.filter(p => p.timestamp >= cutoff);

    if (recentPerf.length === 0) {
      return null;
    }

    // Calculate trends
    const hashRates = recentPerf.map(p => p.hashRate);
    const cpuUsages = recentPerf.map(p => p.cpuUsage);
    const memoryUsages = recentPerf.map(p => p.memoryUsage);

    return {
      duration,
      samples: recentPerf.length,
      hashRate: {
        avg: this.calculateAverage(hashRates),
        min: Math.min(...hashRates),
        max: Math.max(...hashRates),
        trend: this.calculateTrend(hashRates)
      },
      cpuUsage: {
        avg: this.calculateAverage(cpuUsages),
        min: Math.min(...cpuUsages),
        max: Math.max(...cpuUsages)
      },
      memoryUsage: {
        avg: this.calculateAverage(memoryUsages),
        min: Math.min(...memoryUsages),
        max: Math.max(...memoryUsages)
      }
    };
  }

  getErrorReport() {
    const recentErrors = this.metrics.errors.slice(-50);

    // Group by error type
    const byType = {};
    for (const error of recentErrors) {
      const type = error.message.split(':')[0];
      byType[type] = (byType[type] || 0) + 1;
    }

    // Group by context
    const byContext = {};
    for (const error of recentErrors) {
      const context = error.context || 'unknown';
      byContext[context] = (byContext[context] || 0) + 1;
    }

    return {
      total: this.metrics.errors.length,
      recent: recentErrors.length,
      byType,
      byContext,
      latest: recentErrors.slice(-10)
    };
  }

  startMonitoring() {
    // Monitor performance every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 5000);

    // Save analytics every minute
    this.saveInterval = setInterval(() => {
      this.saveAnalytics();
    }, 60000);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
  }

  collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      navigation: {
        type: performance.navigation?.type,
        redirectCount: performance.navigation?.redirectCount
      }
    };

    this.trackPerformance(metrics);
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';

    const recent = values.slice(-10);
    const older = values.slice(-20, -10);

    if (older.length === 0) return 'stable';

    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);

    if (recentAvg > olderAvg * 1.1) return 'improving';
    if (recentAvg < olderAvg * 0.9) return 'degrading';
    return 'stable';
  }

  getDeviceInfo() {
    return {
      cores: navigator.hardwareConcurrency,
      memory: navigator.deviceMemory,
      platform: navigator.platform,
      language: navigator.language
    };
  }

  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      online: navigator.onLine
    };
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  persistEvent(event) {
    const stored = localStorage.getItem('asuranity_events') || '[]';
    const events = JSON.parse(stored);
    events.push(event);

    // Keep last 1000 events
    if (events.length > 1000) {
      events.shift();
    }

    localStorage.setItem('asuranity_events', JSON.stringify(events));
  }

  saveAnalytics() {
    const data = {
      sessions: Array.from(this.sessions.entries()),
      metrics: {
        generation: this.metrics.generation,
        patterns: Array.from(this.metrics.patterns.entries()),
        networks: Array.from(this.metrics.networks.entries())
      },
      timestamp: Date.now()
    };

    localStorage.setItem('asuranity_analytics', JSON.stringify(data));
  }

  loadAnalytics() {
    const stored = localStorage.getItem('asuranity_analytics');
    if (!stored) return;

    try {
      const data = JSON.parse(stored);

      this.sessions = new Map(data.sessions || []);
      this.metrics.generation = data.metrics.generation || this.metrics.generation;
      this.metrics.patterns = new Map(data.metrics.patterns || []);
      this.metrics.networks = new Map(data.metrics.networks || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  exportAnalytics() {
    return {
      version: '1.0',
      exported: Date.now(),
      analytics: this.getAnalytics()
    };
  }

  reset() {
    this.events = [];
    this.sessions.clear();
    this.metrics = {
      generation: {
        total: 0,
        successful: 0,
        failed: 0,
        avgTime: 0,
        avgHashRate: 0
      },
      patterns: new Map(),
      networks: new Map(),
      performance: [],
      errors: []
    };

    this.currentSession = this.createSession();

    localStorage.removeItem('asuranity_events');
    localStorage.removeItem('asuranity_analytics');
  }
}

export default AnalyticsSystem;
