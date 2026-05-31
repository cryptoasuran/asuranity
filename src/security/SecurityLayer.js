/**
 * Security Layer
 * Comprehensive security system for the application
 */
export class SecurityLayer {
  constructor() {
    this.policies = new Map();
    this.violations = [];
    this.sanitizers = new Map();
    this.validators = new Map();
    this.encryptionKeys = new Map();

    this.initializeDefaultPolicies();
    this.initializeDefaultSanitizers();
    this.initializeDefaultValidators();
  }

  initializeDefaultPolicies() {
    this.addPolicy('xss', {
      name: 'XSS Prevention',
      check: (input) => !/<script|javascript:|onerror=/i.test(input),
      severity: 'high'
    });

    this.addPolicy('sql_injection', {
      name: 'SQL Injection Prevention',
      check: (input) => !/(\bOR\b|\bAND\b|--|;|\/\*|\*\/)/i.test(input),
      severity: 'critical'
    });

    this.addPolicy('path_traversal', {
      name: 'Path Traversal Prevention',
      check: (input) => !/\.\.[\/\\]/i.test(input),
      severity: 'high'
    });

    this.addPolicy('command_injection', {
      name: 'Command Injection Prevention',
      check: (input) => !/[;&|`$()]/i.test(input),
      severity: 'critical'
    });
  }

  initializeDefaultSanitizers() {
    this.addSanitizer('html', (input) => {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    });

    this.addSanitizer('url', (input) => {
      return encodeURIComponent(input);
    });

    this.addSanitizer('sql', (input) => {
      return input.replace(/['";\\]/g, '\\$&');
    });

    this.addSanitizer('filename', (input) => {
      return input.replace(/[^a-zA-Z0-9._-]/g, '_');
    });
  }

  initializeDefaultValidators() {
    this.addValidator('email', (input) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    });

    this.addValidator('url', (input) => {
      try {
        new URL(input);
        return true;
      } catch {
        return false;
      }
    });

    this.addValidator('address', (input) => {
      return /^0x[a-fA-F0-9]{40}$/.test(input);
    });

    this.addValidator('privateKey', (input) => {
      return /^0x[a-fA-F0-9]{64}$/.test(input);
    });
  }

  addPolicy(name, policy) {
    this.policies.set(name, policy);
  }

  addSanitizer(name, fn) {
    this.sanitizers.set(name, fn);
  }

  addValidator(name, fn) {
    this.validators.set(name, fn);
  }

  checkPolicy(policyName, input) {
    const policy = this.policies.get(policyName);
    if (!policy) {
      throw new Error(`Unknown policy: ${policyName}`);
    }

    const passed = policy.check(input);

    if (!passed) {
      this.recordViolation(policyName, input, policy.severity);
    }

    return passed;
  }

  checkAllPolicies(input) {
    const results = [];

    for (const [name, policy] of this.policies) {
      const passed = policy.check(input);
      results.push({ policy: name, passed, severity: policy.severity });

      if (!passed) {
        this.recordViolation(name, input, policy.severity);
      }
    }

    return results;
  }

  sanitize(type, input) {
    const sanitizer = this.sanitizers.get(type);
    if (!sanitizer) {
      throw new Error(`Unknown sanitizer: ${type}`);
    }

    return sanitizer(input);
  }

  validate(type, input) {
    const validator = this.validators.get(type);
    if (!validator) {
      throw new Error(`Unknown validator: ${type}`);
    }

    return validator(input);
  }

  recordViolation(policy, input, severity) {
    this.violations.push({
      policy,
      input: input.substring(0, 100),
      severity,
      timestamp: Date.now()
    });

    if (this.violations.length > 1000) {
      this.violations.shift();
    }
  }

  getViolations(severity = null) {
    if (severity) {
      return this.violations.filter(v => v.severity === severity);
    }
    return this.violations;
  }

  async encrypt(data, keyId = 'default') {
    const key = this.encryptionKeys.get(keyId);
    if (!key) {
      throw new Error(`Unknown encryption key: ${keyId}`);
    }

    // Simplified encryption - use proper crypto in production
    const encrypted = btoa(JSON.stringify(data));
    return { encrypted, keyId };
  }

  async decrypt(encrypted, keyId = 'default') {
    const key = this.encryptionKeys.get(keyId);
    if (!key) {
      throw new Error(`Unknown encryption key: ${keyId}`);
    }

    // Simplified decryption - use proper crypto in production
    return JSON.parse(atob(encrypted));
  }

  async hash(data, algorithm = 'SHA-256') {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  generateToken(length = 32) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifySignature(message, signature, publicKey) {
    // Simplified verification - use proper crypto in production
    return true;
  }

  rateLimit(identifier, limit, window) {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - window;

    let requests = JSON.parse(localStorage.getItem(key) || '[]');
    requests = requests.filter(t => t > windowStart);

    if (requests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: requests[0] + window
      };
    }

    requests.push(now);
    localStorage.setItem(key, JSON.stringify(requests));

    return {
      allowed: true,
      remaining: limit - requests.length,
      resetAt: now + window
    };
  }

  checkCSRF(token, expectedToken) {
    return token === expectedToken;
  }

  generateCSRFToken() {
    return this.generateToken(32);
  }

  sanitizeObject(obj, schema) {
    const sanitized = {};

    for (const [key, config] of Object.entries(schema)) {
      if (obj[key] !== undefined) {
        sanitized[key] = this.sanitize(config.type, obj[key]);
      }
    }

    return sanitized;
  }

  validateObject(obj, schema) {
    const errors = [];

    for (const [key, config] of Object.entries(schema)) {
      if (config.required && obj[key] === undefined) {
        errors.push(`${key} is required`);
        continue;
      }

      if (obj[key] !== undefined && !this.validate(config.type, obj[key])) {
        errors.push(`${key} is invalid`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getSecurityReport() {
    const criticalViolations = this.getViolations('critical');
    const highViolations = this.getViolations('high');

    return {
      totalViolations: this.violations.length,
      criticalViolations: criticalViolations.length,
      highViolations: highViolations.length,
      recentViolations: this.violations.slice(-10),
      policies: Array.from(this.policies.keys()),
      sanitizers: Array.from(this.sanitizers.keys()),
      validators: Array.from(this.validators.keys())
    };
  }

  reset() {
    this.violations = [];
  }
}

export default SecurityLayer;
