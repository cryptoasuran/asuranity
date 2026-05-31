export class PatternMatcher {
  constructor(pattern, options = {}) {
    this.pattern = pattern;
    this.type = options.type || 'prefix';
    this.caseSensitive = options.caseSensitive || false;
    this.compiled = this.compile();
  }

  compile() {
    const pattern = this.caseSensitive ? this.pattern : this.pattern.toLowerCase();

    switch (this.type) {
      case 'prefix':
        return (address) => {
          const addr = this.caseSensitive ? address : address.toLowerCase();
          return addr.startsWith(pattern);
        };

      case 'suffix':
        return (address) => {
          const addr = this.caseSensitive ? address : address.toLowerCase();
          return addr.endsWith(pattern);
        };

      case 'contains':
        return (address) => {
          const addr = this.caseSensitive ? address : address.toLowerCase();
          return addr.includes(pattern);
        };

      case 'regex':
        const flags = this.caseSensitive ? '' : 'i';
        const regex = new RegExp(pattern, flags);
        return (address) => regex.test(address);

      case 'exact':
        return (address) => {
          const addr = this.caseSensitive ? address : address.toLowerCase();
          return addr === pattern;
        };

      case 'custom':
        return this.pattern;

      default:
        throw new Error(`Unknown pattern type: ${this.type}`);
    }
  }

  test(address) {
    return this.compiled(address);
  }

  getDifficulty() {
    const charset = this.caseSensitive ? 62 : 36;
    const length = this.pattern.length;

    switch (this.type) {
      case 'prefix':
      case 'suffix':
        return Math.pow(charset, length);

      case 'contains':
        return Math.pow(charset, length) / length;

      case 'exact':
        return Math.pow(charset, this.pattern.length);

      default:
        return Infinity;
    }
  }

  getProbability() {
    return 1 / this.getDifficulty();
  }

  getEstimatedTime(hashRate) {
    const difficulty = this.getDifficulty();
    return difficulty / hashRate;
  }

  static validatePattern(pattern, type) {
    if (!pattern || pattern.length === 0) {
      return { valid: false, error: 'Pattern cannot be empty' };
    }

    if (type === 'regex') {
      try {
        new RegExp(pattern);
      } catch (e) {
        return { valid: false, error: 'Invalid regex pattern' };
      }
    }

    const validChars = /^[0-9a-fA-F]+$/;
    if (type !== 'regex' && !validChars.test(pattern)) {
      return { valid: false, error: 'Pattern must contain only hex characters (0-9, a-f)' };
    }

    if (pattern.length > 40) {
      return { valid: false, error: 'Pattern too long (max 40 characters)' };
    }

    return { valid: true };
  }

  static estimateDifficulty(pattern, type, caseSensitive = false) {
    const matcher = new PatternMatcher(pattern, { type, caseSensitive });
    return matcher.getDifficulty();
  }
}

export default PatternMatcher;
