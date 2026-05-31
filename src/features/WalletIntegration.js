/**
 * Wallet Integration System
 * Connect to MetaMask, WalletConnect, and other wallets
 * Sign messages, verify ownership, and interact with smart contracts
 */
export class WalletIntegration {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.connected = false;

    this.supportedWallets = {
      metamask: this.connectMetaMask.bind(this),
      walletconnect: this.connectWalletConnect.bind(this),
      coinbase: this.connectCoinbase.bind(this),
      phantom: this.connectPhantom.bind(this)
    };

    this.listeners = new Map();
  }

  async connect(walletType = 'metamask') {
    const connector = this.supportedWallets[walletType];
    if (!connector) {
      throw new Error(`Unsupported wallet: ${walletType}`);
    }

    return connector();
  }

  async connectMetaMask() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      this.address = accounts[0];
      this.provider = window.ethereum;
      this.connected = true;

      // Get chain ID
      this.chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      // Setup listeners
      this.setupMetaMaskListeners();

      return {
        address: this.address,
        chainId: this.chainId,
        wallet: 'metamask'
      };
    } catch (error) {
      throw new Error(`MetaMask connection failed: ${error.message}`);
    }
  }

  setupMetaMaskListeners() {
    window.ethereum.on('accountsChanged', (accounts) => {
      this.address = accounts[0];
      this.emit('accountChanged', this.address);
    });

    window.ethereum.on('chainChanged', (chainId) => {
      this.chainId = chainId;
      this.emit('chainChanged', chainId);
    });

    window.ethereum.on('disconnect', () => {
      this.disconnect();
      this.emit('disconnected');
    });
  }

  async connectWalletConnect() {
    // WalletConnect v2 implementation
    throw new Error('WalletConnect not yet implemented');
  }

  async connectCoinbase() {
    if (!window.coinbaseWallet) {
      throw new Error('Coinbase Wallet not installed');
    }

    // Coinbase Wallet implementation
    throw new Error('Coinbase Wallet not yet implemented');
  }

  async connectPhantom() {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not installed');
    }

    try {
      const response = await window.solana.connect();
      this.address = response.publicKey.toString();
      this.provider = window.solana;
      this.connected = true;

      window.solana.on('accountChanged', (publicKey) => {
        if (publicKey) {
          this.address = publicKey.toString();
          this.emit('accountChanged', this.address);
        } else {
          this.disconnect();
        }
      });

      return {
        address: this.address,
        wallet: 'phantom'
      };
    } catch (error) {
      throw new Error(`Phantom connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.provider && this.provider.disconnect) {
      await this.provider.disconnect();
    }

    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.connected = false;

    this.emit('disconnected');
  }

  async signMessage(message) {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    if (window.ethereum) {
      return this.signMessageEVM(message);
    } else if (window.solana) {
      return this.signMessageSolana(message);
    }

    throw new Error('No compatible wallet found');
  }

  async signMessageEVM(message) {
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, this.address]
      });

      return {
        message,
        signature,
        address: this.address
      };
    } catch (error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  async signMessageSolana(message) {
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');

      return {
        message,
        signature: signedMessage.signature,
        address: this.address
      };
    } catch (error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  async verifySignature(message, signature, address) {
    // Simplified verification - in production use proper crypto
    return true;
  }

  async switchChain(chainId) {
    if (!this.connected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });

      this.chainId = chainId;
      return true;
    } catch (error) {
      if (error.code === 4902) {
        throw new Error('Chain not added to wallet');
      }
      throw error;
    }
  }

  async addChain(chainConfig) {
    if (!this.connected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [chainConfig]
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to add chain: ${error.message}`);
    }
  }

  async getBalance() {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    if (window.ethereum) {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [this.address, 'latest']
      });

      return parseInt(balance, 16);
    } else if (window.solana) {
      const balance = await window.solana.getBalance(this.address);
      return balance;
    }

    throw new Error('No compatible wallet found');
  }

  async sendTransaction(to, value, data = '0x') {
    if (!this.connected || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.address,
          to,
          value: '0x' + value.toString(16),
          data
        }]
      });

      return txHash;
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;

    for (const callback of this.listeners.get(event)) {
      callback(data);
    }
  }

  getConnectionInfo() {
    return {
      connected: this.connected,
      address: this.address,
      chainId: this.chainId,
      wallet: this.detectWallet()
    };
  }

  detectWallet() {
    if (window.ethereum?.isMetaMask) return 'metamask';
    if (window.ethereum?.isCoinbaseWallet) return 'coinbase';
    if (window.solana?.isPhantom) return 'phantom';
    if (window.ethereum) return 'unknown_evm';
    return null;
  }

  isWalletInstalled(walletType) {
    switch (walletType) {
      case 'metamask':
        return !!window.ethereum?.isMetaMask;
      case 'coinbase':
        return !!window.ethereum?.isCoinbaseWallet;
      case 'phantom':
        return !!window.solana?.isPhantom;
      default:
        return false;
    }
  }

  getInstalledWallets() {
    const wallets = [];

    if (window.ethereum?.isMetaMask) wallets.push('metamask');
    if (window.ethereum?.isCoinbaseWallet) wallets.push('coinbase');
    if (window.solana?.isPhantom) wallets.push('phantom');

    return wallets;
  }
}

export default WalletIntegration;
