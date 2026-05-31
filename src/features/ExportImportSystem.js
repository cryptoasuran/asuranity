/**
 * Export/Import System
 * Export results to JSON, CSV, wallet files
 * Import existing wallets and patterns
 */
export class ExportImportSystem {
  constructor() {
    this.formats = {
      json: this.exportJSON.bind(this),
      csv: this.exportCSV.bind(this),
      wallet: this.exportWallet.bind(this),
      text: this.exportText.bind(this)
    };

    this.importers = {
      json: this.importJSON.bind(this),
      csv: this.importCSV.bind(this),
      wallet: this.importWallet.bind(this)
    };
  }

  async export(results, format = 'json', options = {}) {
    const exporter = this.formats[format];
    if (!exporter) {
      throw new Error(`Unsupported format: ${format}`);
    }

    const data = await exporter(results, options);
    return this.download(data, format, options.filename);
  }

  exportJSON(results, options) {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      count: results.length,
      results: results.map(r => ({
        address: r.address,
        privateKey: options.includePrivateKeys ? r.privateKey : undefined,
        publicKey: r.publicKey,
        mnemonic: options.includeMnemonic ? r.mnemonic : undefined,
        pattern: r.pattern,
        patternType: r.patternType,
        network: r.network,
        timestamp: r.timestamp
      }))
    };

    return JSON.stringify(data, null, 2);
  }

  exportCSV(results, options) {
    const headers = ['Address', 'Pattern', 'Type', 'Network', 'Timestamp'];

    if (options.includePrivateKeys) {
      headers.push('Private Key');
    }
    if (options.includePublicKey) {
      headers.push('Public Key');
    }

    const rows = [headers.join(',')];

    for (const result of results) {
      const row = [
        result.address,
        result.pattern,
        result.patternType,
        result.network,
        new Date(result.timestamp).toISOString()
      ];

      if (options.includePrivateKeys) {
        row.push(result.privateKey);
      }
      if (options.includePublicKey) {
        row.push(result.publicKey);
      }

      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  exportWallet(results, options) {
    // Export in wallet-compatible format
    const wallets = results.map(r => ({
      address: r.address,
      privateKey: r.privateKey,
      mnemonic: r.mnemonic,
      derivationPath: r.derivationPath,
      network: r.network
    }));

    return JSON.stringify({
      version: '1.0',
      type: 'wallet_export',
      wallets
    }, null, 2);
  }

  exportText(results, options) {
    const lines = [];

    lines.push('ASURANITY - Vanity Address Export');
    lines.push('='.repeat(50));
    lines.push(`Exported: ${new Date().toISOString()}`);
    lines.push(`Count: ${results.length}`);
    lines.push('');

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      lines.push(`Result #${i + 1}`);
      lines.push(`Address: ${r.address}`);
      lines.push(`Pattern: ${r.pattern} (${r.patternType})`);
      lines.push(`Network: ${r.network}`);

      if (options.includePrivateKeys) {
        lines.push(`Private Key: ${r.privateKey}`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  async import(file) {
    const content = await this.readFile(file);
    const format = this.detectFormat(file.name, content);

    const importer = this.importers[format];
    if (!importer) {
      throw new Error(`Unsupported format: ${format}`);
    }

    return importer(content);
  }

  importJSON(content) {
    try {
      const data = JSON.parse(content);

      if (data.version !== '1.0') {
        throw new Error('Unsupported version');
      }

      return data.results || data.wallets || [];
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  importCSV(content) {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      throw new Error('Empty CSV file');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const result = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].toLowerCase().replace(/\s+/g, '');
        result[header] = values[j];
      }

      results.push(result);
    }

    return results;
  }

  importWallet(content) {
    try {
      const data = JSON.parse(content);

      if (data.type !== 'wallet_export') {
        throw new Error('Not a wallet export file');
      }

      return data.wallets || [];
    } catch (error) {
      throw new Error(`Invalid wallet file: ${error.message}`);
    }
  }

  detectFormat(filename, content) {
    const ext = filename.split('.').pop().toLowerCase();

    if (ext === 'json') {
      try {
        const data = JSON.parse(content);
        if (data.type === 'wallet_export') return 'wallet';
        return 'json';
      } catch {
        return 'json';
      }
    }

    if (ext === 'csv') return 'csv';

    // Try to detect from content
    if (content.trim().startsWith('{')) return 'json';
    if (content.includes(',') && content.includes('\n')) return 'csv';

    throw new Error('Unknown format');
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));

      reader.readAsText(file);
    });
  }

  download(content, format, filename) {
    const blob = new Blob([content], {
      type: this.getMimeType(format)
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename || this.generateFilename(format);
    link.click();

    URL.revokeObjectURL(url);

    return { success: true, filename: link.download };
  }

  getMimeType(format) {
    const types = {
      json: 'application/json',
      csv: 'text/csv',
      wallet: 'application/json',
      text: 'text/plain'
    };

    return types[format] || 'application/octet-stream';
  }

  generateFilename(format) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `asuranity-export-${timestamp}.${format}`;
  }

  async exportToClipboard(results, format = 'json', options = {}) {
    const exporter = this.formats[format];
    if (!exporter) {
      throw new Error(`Unsupported format: ${format}`);
    }

    const data = await exporter(results, options);

    try {
      await navigator.clipboard.writeText(data);
      return { success: true, message: 'Copied to clipboard' };
    } catch (error) {
      throw new Error(`Failed to copy: ${error.message}`);
    }
  }

  async importFromClipboard() {
    try {
      const content = await navigator.clipboard.readText();
      const format = this.detectFormat('clipboard.txt', content);

      const importer = this.importers[format];
      if (!importer) {
        throw new Error(`Unsupported format: ${format}`);
      }

      return importer(content);
    } catch (error) {
      throw new Error(`Failed to import: ${error.message}`);
    }
  }

  validateImport(results) {
    const errors = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (!result.address) {
        errors.push(`Result ${i + 1}: Missing address`);
      }

      if (!result.network) {
        errors.push(`Result ${i + 1}: Missing network`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async backup(data, options = {}) {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      type: 'full_backup',
      data: {
        results: data.results || [],
        settings: data.settings || {},
        history: data.history || [],
        analytics: data.analytics || {}
      }
    };

    if (options.encrypt) {
      backup.encrypted = true;
      backup.data = await this.encrypt(JSON.stringify(backup.data), options.password);
    }

    return this.download(
      JSON.stringify(backup, null, 2),
      'json',
      `asuranity-backup-${Date.now()}.json`
    );
  }

  async restore(file, options = {}) {
    const content = await this.readFile(file);
    const backup = JSON.parse(content);

    if (backup.version !== '1.0') {
      throw new Error('Unsupported backup version');
    }

    if (backup.type !== 'full_backup') {
      throw new Error('Not a backup file');
    }

    let data = backup.data;

    if (backup.encrypted) {
      if (!options.password) {
        throw new Error('Password required for encrypted backup');
      }

      data = JSON.parse(await this.decrypt(data, options.password));
    }

    return data;
  }

  async encrypt(data, password) {
    // Simplified encryption - use proper crypto in production
    return btoa(data);
  }

  async decrypt(data, password) {
    // Simplified decryption - use proper crypto in production
    return atob(data);
  }
}

export default ExportImportSystem;
