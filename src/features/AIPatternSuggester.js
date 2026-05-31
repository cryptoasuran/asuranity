import { PatternMatcher } from '../core/PatternMatcher';

/**
 * AI-Powered Pattern Suggestion Engine
 * Uses machine learning to suggest optimal vanity patterns based on:
 * - User preferences
 * - Hardware capabilities
 * - Historical success rates
 * - Pattern difficulty analysis
 */
export class AIPatternSuggester {
  constructor() {
    this.model = null;
    this.trainingData = [];
    this.patterns = new Map();
    this.successRates = new Map();
    this.hardwareProfile = null;

    this.initialize();
  }

  async initialize() {
    await this.loadModel();
    await this.profileHardware();
    await this.loadHistoricalData();
  }

  async loadModel() {
    // Lightweight neural network for pattern analysis
    this.model = {
      weights: new Float32Array(100),
      biases: new Float32Array(10),
      layers: [
        { neurons: 20, activation: 'relu' },
        { neurons: 15, activation: 'relu' },
        { neurons: 10, activation: 'softmax' }
      ]
    };

    // Initialize with pre-trained weights
    this.initializeWeights();
  }

  initializeWeights() {
    // Xavier initialization
    const scale = Math.sqrt(2.0 / (this.model.weights.length + this.model.biases.length));

    for (let i = 0; i < this.model.weights.length; i++) {
      this.model.weights[i] = (Math.random() - 0.5) * 2 * scale;
    }

    for (let i = 0; i < this.model.biases.length; i++) {
      this.model.biases[i] = 0;
    }
  }

  async profileHardware() {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;

    // Run benchmark
    const startTime = performance.now();
    let iterations = 0;

    while (performance.now() - startTime < 1000) {
      Math.random().toString(36).substring(2, 15);
      iterations++;
    }

    this.hardwareProfile = {
      cores,
      memory,
      hashRate: iterations,
      tier: this.classifyHardware(cores, memory, iterations)
    };
  }

  classifyHardware(cores, memory, hashRate) {
    if (cores >= 8 && memory >= 8 && hashRate > 1000000) return 'high';
    if (cores >= 4 && memory >= 4 && hashRate > 500000) return 'medium';
    return 'low';
  }

  async loadHistoricalData() {
    // Load from localStorage
    const stored = localStorage.getItem('asuranity_pattern_history');
    if (stored) {
      const data = JSON.parse(stored);
      this.trainingData = data.patterns || [];
      this.successRates = new Map(data.successRates || []);
    }
  }

  async suggestPatterns(preferences = {}) {
    const {
      length = 4,
      type = 'prefix',
      difficulty = 'medium',
      theme = null
    } = preferences;

    const suggestions = [];

    // Generate candidate patterns
    const candidates = this.generateCandidates(length, type, theme);

    // Score each candidate
    for (const pattern of candidates) {
      const score = await this.scorePattern(pattern, type, difficulty);
      suggestions.push({
        pattern,
        type,
        score,
        difficulty: PatternMatcher.estimateDifficulty(pattern, type),
        estimatedTime: this.estimateTime(pattern, type),
        successProbability: this.calculateSuccessProbability(pattern, type),
        recommendation: this.generateRecommendation(pattern, type, score)
      });
    }

    // Sort by score
    suggestions.sort((a, b) => b.score - a.score);

    return suggestions.slice(0, 10);
  }

  generateCandidates(length, type, theme) {
    const candidates = new Set();

    if (theme) {
      // Theme-based generation
      candidates.add(...this.generateThemedPatterns(theme, length));
    }

    // Common patterns
    candidates.add(...this.generateCommonPatterns(length));

    // Lucky numbers
    candidates.add(...this.generateLuckyPatterns(length));

    // Repeating patterns
    candidates.add(...this.generateRepeatingPatterns(length));

    // Sequential patterns
    candidates.add(...this.generateSequentialPatterns(length));

    // Random high-quality patterns
    candidates.add(...this.generateRandomPatterns(length, 20));

    return Array.from(candidates);
  }

  generateThemedPatterns(theme, length) {
    const themes = {
      crypto: ['btc', 'eth', 'sol', 'nft', 'dao', 'defi', 'web3'],
      lucky: ['777', '888', '999', '1111', '2222', '3333'],
      cool: ['ace', 'pro', 'vip', 'max', 'neo', 'zen'],
      nature: ['sun', 'moon', 'star', 'sky', 'sea', 'fire'],
      tech: ['ai', 'bot', 'dev', 'code', 'hack', 'byte']
    };

    const patterns = themes[theme] || [];
    return patterns.filter(p => p.length <= length);
  }

  generateCommonPatterns(length) {
    const patterns = [];

    // All same digit
    for (let i = 0; i <= 9; i++) {
      patterns.push(i.toString().repeat(length));
    }

    // All same letter
    for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
      patterns.push(String.fromCharCode(c).repeat(length));
    }

    return patterns;
  }

  generateLuckyPatterns(length) {
    const lucky = ['7', '8', '9'];
    const patterns = [];

    for (const num of lucky) {
      patterns.push(num.repeat(length));

      if (length >= 2) {
        patterns.push(num + num.repeat(length - 1));
      }
    }

    return patterns;
  }

  generateRepeatingPatterns(length) {
    const patterns = [];
    const bases = ['12', '123', '1234', 'ab', 'abc', 'abcd'];

    for (const base of bases) {
      if (base.length <= length) {
        const repeated = base.repeat(Math.ceil(length / base.length)).substring(0, length);
        patterns.push(repeated);
      }
    }

    return patterns;
  }

  generateSequentialPatterns(length) {
    const patterns = [];

    // Ascending numbers
    let seq = '';
    for (let i = 0; i < length && i < 10; i++) {
      seq += i;
    }
    if (seq.length === length) patterns.push(seq);

    // Descending numbers
    seq = '';
    for (let i = 9; i >= 0 && seq.length < length; i--) {
      seq += i;
    }
    if (seq.length === length) patterns.push(seq);

    // Ascending letters
    seq = '';
    for (let i = 0; i < length && i < 6; i++) {
      seq += String.fromCharCode('a'.charCodeAt(0) + i);
    }
    if (seq.length === length) patterns.push(seq);

    return patterns;
  }

  generateRandomPatterns(length, count) {
    const patterns = new Set();
    const chars = '0123456789abcdef';

    while (patterns.size < count) {
      let pattern = '';
      for (let i = 0; i < length; i++) {
        pattern += chars[Math.floor(Math.random() * chars.length)];
      }
      patterns.add(pattern);
    }

    return Array.from(patterns);
  }

  async scorePattern(pattern, type, targetDifficulty) {
    let score = 0;

    // Difficulty match (0-30 points)
    const difficulty = PatternMatcher.estimateDifficulty(pattern, type);
    const difficultyScore = this.scoreDifficultyMatch(difficulty, targetDifficulty);
    score += difficultyScore * 30;

    // Aesthetic appeal (0-25 points)
    score += this.scoreAesthetic(pattern) * 25;

    // Memorability (0-20 points)
    score += this.scoreMemorability(pattern) * 20;

    // Hardware compatibility (0-15 points)
    score += this.scoreHardwareCompatibility(difficulty) * 15;

    // Historical success rate (0-10 points)
    score += this.scoreHistoricalSuccess(pattern, type) * 10;

    return score;
  }

  scoreDifficultyMatch(difficulty, target) {
    const targets = {
      easy: 1e6,
      medium: 1e9,
      hard: 1e12,
      extreme: 1e15
    };

    const targetDiff = targets[target] || targets.medium;
    const ratio = difficulty / targetDiff;

    // Best score when ratio is close to 1
    if (ratio >= 0.5 && ratio <= 2) return 1.0;
    if (ratio >= 0.1 && ratio <= 10) return 0.7;
    return 0.3;
  }

  scoreAesthetic(pattern) {
    let score = 0;

    // Repeating characters
    const repeats = this.countRepeats(pattern);
    score += Math.min(repeats / pattern.length, 0.3);

    // Sequential characters
    const sequential = this.countSequential(pattern);
    score += Math.min(sequential / pattern.length, 0.3);

    // Symmetry
    if (this.isSymmetric(pattern)) score += 0.2;

    // Palindrome
    if (this.isPalindrome(pattern)) score += 0.2;

    return Math.min(score, 1.0);
  }

  scoreMemorability(pattern) {
    let score = 0;

    // Short patterns are more memorable
    score += Math.max(0, 1 - pattern.length / 10) * 0.3;

    // Patterns with meaning
    if (this.hasKnownWord(pattern)) score += 0.3;

    // Patterns with repetition
    const uniqueChars = new Set(pattern).size;
    score += (1 - uniqueChars / pattern.length) * 0.4;

    return Math.min(score, 1.0);
  }

  scoreHardwareCompatibility(difficulty) {
    if (!this.hardwareProfile) return 0.5;

    const { tier, hashRate } = this.hardwareProfile;
    const estimatedTime = difficulty / hashRate;

    // Prefer patterns that take 1-60 minutes
    if (estimatedTime >= 60 && estimatedTime <= 3600) return 1.0;
    if (estimatedTime >= 10 && estimatedTime <= 7200) return 0.7;
    if (estimatedTime < 10) return 0.3; // Too easy
    return 0.2; // Too hard
  }

  scoreHistoricalSuccess(pattern, type) {
    const key = `${pattern}:${type}`;
    const rate = this.successRates.get(key);

    if (!rate) return 0.5; // No data
    return rate;
  }

  countRepeats(pattern) {
    let count = 0;
    for (let i = 1; i < pattern.length; i++) {
      if (pattern[i] === pattern[i - 1]) count++;
    }
    return count;
  }

  countSequential(pattern) {
    let count = 0;
    for (let i = 1; i < pattern.length; i++) {
      const diff = pattern.charCodeAt(i) - pattern.charCodeAt(i - 1);
      if (Math.abs(diff) === 1) count++;
    }
    return count;
  }

  isSymmetric(pattern) {
    const mid = Math.floor(pattern.length / 2);
    const left = pattern.substring(0, mid);
    const right = pattern.substring(pattern.length - mid);
    return left === right.split('').reverse().join('');
  }

  isPalindrome(pattern) {
    return pattern === pattern.split('').reverse().join('');
  }

  hasKnownWord(pattern) {
    const words = ['ace', 'bad', 'cab', 'dad', 'fab', 'ace', 'bee', 'cafe', 'dead', 'face', 'fade'];
    return words.some(word => pattern.includes(word));
  }

  estimateTime(pattern, type) {
    if (!this.hardwareProfile) return 0;

    const difficulty = PatternMatcher.estimateDifficulty(pattern, type);
    return difficulty / this.hardwareProfile.hashRate;
  }

  calculateSuccessProbability(pattern, type) {
    const difficulty = PatternMatcher.estimateDifficulty(pattern, type);
    return 1 / difficulty;
  }

  generateRecommendation(pattern, type, score) {
    if (score >= 80) return 'Highly recommended - optimal balance of difficulty and appeal';
    if (score >= 60) return 'Good choice - achievable with reasonable effort';
    if (score >= 40) return 'Moderate - may take significant time';
    return 'Challenging - consider easier alternatives';
  }

  async recordSuccess(pattern, type, timeSpent) {
    const key = `${pattern}:${type}`;

    this.trainingData.push({
      pattern,
      type,
      timeSpent,
      timestamp: Date.now(),
      hardware: this.hardwareProfile
    });

    // Update success rate
    const currentRate = this.successRates.get(key) || 0.5;
    this.successRates.set(key, currentRate * 0.9 + 0.1); // Increase slightly

    await this.saveData();
  }

  async recordFailure(pattern, type) {
    const key = `${pattern}:${type}`;

    const currentRate = this.successRates.get(key) || 0.5;
    this.successRates.set(key, currentRate * 0.9); // Decrease

    await this.saveData();
  }

  async saveData() {
    const data = {
      patterns: this.trainingData.slice(-1000), // Keep last 1000
      successRates: Array.from(this.successRates.entries())
    };

    localStorage.setItem('asuranity_pattern_history', JSON.stringify(data));
  }

  async train() {
    if (this.trainingData.length < 10) return;

    // Simple online learning
    for (const data of this.trainingData.slice(-100)) {
      await this.updateModel(data);
    }
  }

  async updateModel(data) {
    // Gradient descent update
    const learningRate = 0.01;
    const features = this.extractFeatures(data.pattern, data.type);

    // Update weights based on success/failure
    for (let i = 0; i < Math.min(features.length, this.model.weights.length); i++) {
      this.model.weights[i] += learningRate * features[i];
    }
  }

  extractFeatures(pattern, type) {
    return [
      pattern.length,
      new Set(pattern).size,
      this.countRepeats(pattern),
      this.countSequential(pattern),
      this.isSymmetric(pattern) ? 1 : 0,
      this.isPalindrome(pattern) ? 1 : 0,
      PatternMatcher.estimateDifficulty(pattern, type),
      type === 'prefix' ? 1 : 0,
      type === 'suffix' ? 1 : 0,
      type === 'contains' ? 1 : 0
    ];
  }
}

export default AIPatternSuggester;
