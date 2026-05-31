import { ethers } from 'ethers';
import { PatternMatcher } from '../../core/PatternMatcher';
import { AddressValidator } from '../../core/AddressValidator';

export class BSCGenerator {
  constructor(config = {}) {
    this.config = {
      chainId: 56,
      symbol: 'BNB',
      explorer: 'https://bscscan.com',
      rpc: 'https://bsc-dataseed.binance.org',
      derivationPath: config.derivationPath || "m/44'/60'/0'/0",
      checksummed: config.checksummed !== false,
      ...config
    };
    
    this.stats = {
      generated: 0,
      checked: 0,
      matches: 0,
      startTime: null,
      hashRate: 0
    };
    
    this.cache = new Map();
    this.provider = null;
  }

  async initialize() {
    if (this.config.rpc) {
      this.provider = new ethers.JsonRpcProvider(this.config.rpc);
    }
  }

  async generate(pattern, options = {}) {
    this.stats.startTime = Date.now();
    const matcher = new PatternMatcher(pattern, options);
    
    while (true) {
      const result = await this.generateAddress();
      this.stats.checked++;

      if (matcher.test(result.address)) {
        this.stats.matches++;
        return result;
      }

      if (this.stats.checked % 1000 === 0) {
        this.updateStats();
      }
    }
  }

  async generateAddress() {
    const wallet = ethers.Wallet.createRandom();
    const address = this.formatAddress(wallet.address);
    
    return {
      address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      mnemonic: wallet.mnemonic?.phrase,
      derivationPath: this.config.derivationPath,
      network: 'bsc',
      chainId: this.config.chainId,
      symbol: this.config.symbol,
      explorer: this.config.explorer,
      timestamp: Date.now()
    };
  }

  formatAddress(address) {
    if (this.config.checksummed) {
      return ethers.getAddress(address);
    }
    return address.toLowerCase();
  }

  async generateBatch(count) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(await this.generateAddress());
    }
    return results;
  }

  async generateFromMnemonic(mnemonic, index = 0) {
    const path = `${this.config.derivationPath}/${index}`;
    const wallet = ethers.Wallet.fromPhrase(mnemonic, path);
    
    return {
      address: this.formatAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      mnemonic,
      derivationPath: path,
      network: 'bsc',
      chainId: this.config.chainId,
      index
    };
  }

  async generateFromPrivateKey(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    
    return {
      address: this.formatAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      network: 'bsc',
      chainId: this.config.chainId
    };
  }

  async generateHDWallet(mnemonic, count = 10) {
    const addresses = [];
    for (let i = 0; i < count; i++) {
      addresses.push(await this.generateFromMnemonic(mnemonic, i));
    }
    return addresses;
  }

  validateAddress(address) {
    return AddressValidator.validateEVM(address);
  }

  getAddressFromPublicKey(publicKey) {
    return ethers.computeAddress(publicKey);
  }

  async getBalance(address) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider.getBalance(address);
  }

  async getTransactionCount(address) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider.getTransactionCount(address);
  }

  getExplorerUrl(address) {
    return `${this.config.explorer}/address/${address}`;
  }

  updateStats() {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    this.stats.hashRate = this.stats.checked / elapsed;
  }

  getStats() {
    this.updateStats();
    return { ...this.stats };
  }

  reset() {
    this.stats = {
      generated: 0,
      checked: 0,
      matches: 0,
      startTime: Date.now(),
      hashRate: 0
    };
  }

  static async quickGenerate(pattern, options) {
    const generator = new BSCGenerator();
    return generator.generate(pattern, options);
  }

  static validateAddress(address) {
    return new BSCGenerator().validateAddress(address);
  }

  static getNetworkInfo() {
    return {
      name: 'BSC',
      chainId: 56,
      symbol: 'BNB',
      explorer: 'https://bscscan.com',
      rpc: 'https://bsc-dataseed.binance.org',
      type: 'EVM'
    };
  }
}

export default BSCGenerator;
