import { ethers } from 'ethers';
import { PatternMatcher } from '../../core/PatternMatcher';

export class PolygonGenerator {
  constructor(config = {}) {
    this.config = {
      derivationPath: config.derivationPath || "m/44'/60'/0'/0",
      addressFormat: config.addressFormat || 'hex',
      checksummed: config.checksummed !== false,
      ...config
    };
    this.stats = {
      generated: 0,
      checked: 0,
      matches: 0,
      startTime: null
    };
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
      network: 'polygon',
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
      network: 'polygon',
      index
    };
  }

  async generateFromPrivateKey(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    
    return {
      address: this.formatAddress(wallet.address),
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      network: 'polygon'
    };
  }

  validateAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  getAddressFromPublicKey(publicKey) {
    return ethers.computeAddress(publicKey);
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
      startTime: Date.now()
    };
  }

  static async quickGenerate(pattern, options) {
    const generator = new PolygonGenerator();
    return generator.generate(pattern, options);
  }

  static validateAddress(address) {
    return new PolygonGenerator().validateAddress(address);
  }

  static getNetworkInfo() {
    return {
      name: 'Polygon',
      type: 'EVM',
      chainId: this.getChainId(),
      symbol: this.getSymbol(),
      decimals: 18,
      explorer: this.getExplorer()
    };
  }

  static getChainId() {
    const chainIds = {
      'Ethereum': 1,
      'BSC': 56,
      'Polygon': 137,
      'Arbitrum': 42161,
      'Optimism': 10,
      'Avalanche': 43114,
      'Fantom': 250,
      'Cronos': 25,
      'Moonbeam': 1284,
      'Harmony': 1666600000,
      'Celo': 42220,
      'Aurora': 1313161554,
      'Gnosis': 100,
      'Metis': 1088,
      'Base': 8453,
      'zkSync': 324,
      'Linea': 59144,
      'Scroll': 534352,
      'Mantle': 5000
    };
    return chainIds['Polygon'] || 1;
  }

  static getSymbol() {
    const symbols = {
      'Ethereum': 'ETH',
      'BSC': 'BNB',
      'Polygon': 'MATIC',
      'Arbitrum': 'ETH',
      'Optimism': 'ETH',
      'Avalanche': 'AVAX',
      'Fantom': 'FTM',
      'Cronos': 'CRO',
      'Moonbeam': 'GLMR',
      'Harmony': 'ONE',
      'Celo': 'CELO',
      'Aurora': 'ETH',
      'Gnosis': 'xDAI',
      'Metis': 'METIS',
      'Base': 'ETH',
      'zkSync': 'ETH',
      'Linea': 'ETH',
      'Scroll': 'ETH',
      'Mantle': 'MNT'
    };
    return symbols['Polygon'] || 'ETH';
  }

  static getExplorer() {
    const explorers = {
      'Ethereum': 'https://etherscan.io',
      'BSC': 'https://bscscan.com',
      'Polygon': 'https://polygonscan.com',
      'Arbitrum': 'https://arbiscan.io',
      'Optimism': 'https://optimistic.etherscan.io',
      'Avalanche': 'https://snowtrace.io',
      'Fantom': 'https://ftmscan.com',
      'Cronos': 'https://cronoscan.com',
      'Moonbeam': 'https://moonscan.io',
      'Harmony': 'https://explorer.harmony.one',
      'Celo': 'https://celoscan.io',
      'Aurora': 'https://aurorascan.dev',
      'Gnosis': 'https://gnosisscan.io',
      'Metis': 'https://andromeda-explorer.metis.io',
      'Base': 'https://basescan.org',
      'zkSync': 'https://explorer.zksync.io',
      'Linea': 'https://lineascan.build',
      'Scroll': 'https://scrollscan.com',
      'Mantle': 'https://explorer.mantle.xyz'
    };
    return explorers['Polygon'] || 'https://etherscan.io';
  }
}

export default PolygonGenerator;
