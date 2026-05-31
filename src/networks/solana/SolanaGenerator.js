import * as solanaWeb3 from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PatternMatcher } from '../../core/PatternMatcher';

export class SolanaGenerator {
  constructor(config = {}) {
    this.config = {
      derivationPath: config.derivationPath || "m/44'/501'/0'/0'",
      cluster: config.cluster || 'mainnet-beta',
      ...config
    };

    this.stats = {
      generated: 0,
      checked: 0,
      matches: 0,
      startTime: null,
      hashRate: 0
    };

    this.connection = null;
  }

  async initialize() {
    const endpoint = this.getClusterEndpoint();
    this.connection = new solanaWeb3.Connection(endpoint, 'confirmed');
  }

  getClusterEndpoint() {
    const endpoints = {
      'mainnet-beta': 'https://api.mainnet-beta.solana.com',
      'testnet': 'https://api.testnet.solana.com',
      'devnet': 'https://api.devnet.solana.com'
    };
    return endpoints[this.config.cluster] || endpoints['mainnet-beta'];
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
    const keypair = solanaWeb3.Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = bs58.encode(keypair.secretKey);

    return {
      address: publicKey,
      publicKey: publicKey,
      privateKey: secretKey,
      secretKey: Array.from(keypair.secretKey),
      network: 'solana',
      cluster: this.config.cluster,
      timestamp: Date.now()
    };
  }

  async generateFromMnemonic(mnemonic, index = 0) {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const path = this.config.derivationPath.replace(/'/g, '');
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keypair = solanaWeb3.Keypair.fromSeed(derivedSeed);

    return {
      address: keypair.publicKey.toBase58(),
      publicKey: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey),
      secretKey: Array.from(keypair.secretKey),
      mnemonic,
      derivationPath: this.config.derivationPath,
      network: 'solana',
      index
    };
  }

  async generateFromPrivateKey(privateKey) {
    const secretKey = bs58.decode(privateKey);
    const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);

    return {
      address: keypair.publicKey.toBase58(),
      publicKey: keypair.publicKey.toBase58(),
      privateKey: privateKey,
      secretKey: Array.from(keypair.secretKey),
      network: 'solana'
    };
  }

  async generateBatch(count) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(await this.generateAddress());
    }
    return results;
  }

  async generateHDWallet(mnemonic, count = 10) {
    const addresses = [];
    for (let i = 0; i < count; i++) {
      addresses.push(await this.generateFromMnemonic(mnemonic, i));
    }
    return addresses;
  }

  validateAddress(address) {
    try {
      new solanaWeb3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async getBalance(address) {
    if (!this.connection) {
      await this.initialize();
    }
    const publicKey = new solanaWeb3.PublicKey(address);
    return this.connection.getBalance(publicKey);
  }

  async getAccountInfo(address) {
    if (!this.connection) {
      await this.initialize();
    }
    const publicKey = new solanaWeb3.PublicKey(address);
    return this.connection.getAccountInfo(publicKey);
  }

  async getTokenAccounts(address) {
    if (!this.connection) {
      await this.initialize();
    }
    const publicKey = new solanaWeb3.PublicKey(address);
    return this.connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });
  }

  getExplorerUrl(address) {
    const explorers = {
      'mainnet-beta': 'https://explorer.solana.com',
      'testnet': 'https://explorer.solana.com/?cluster=testnet',
      'devnet': 'https://explorer.solana.com/?cluster=devnet'
    };
    const base = explorers[this.config.cluster] || explorers['mainnet-beta'];
    return `${base}/address/${address}`;
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
    const generator = new SolanaGenerator();
    return generator.generate(pattern, options);
  }

  static validateAddress(address) {
    return new SolanaGenerator().validateAddress(address);
  }

  static getNetworkInfo() {
    return {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
      explorer: 'https://explorer.solana.com',
      type: 'Non-EVM'
    };
  }
}

export default SolanaGenerator;
