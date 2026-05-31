import { ethers } from 'ethers';
import * as solanaWeb3 from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';

export class AddressValidator {
  static validate(address, network) {
    const validator = this.getValidator(network);
    if (!validator) {
      throw new Error(`Unknown network: ${network}`);
    }
    return validator(address);
  }

  static getValidator(network) {
    const validators = {
      // EVM networks
      ethereum: this.validateEVM,
      bsc: this.validateEVM,
      polygon: this.validateEVM,
      arbitrum: this.validateEVM,
      optimism: this.validateEVM,
      avalanche: this.validateEVM,
      fantom: this.validateEVM,
      cronos: this.validateEVM,
      moonbeam: this.validateEVM,
      harmony: this.validateEVM,
      celo: this.validateEVM,
      aurora: this.validateEVM,
      gnosis: this.validateEVM,
      metis: this.validateEVM,
      base: this.validateEVM,
      zksync: this.validateEVM,
      linea: this.validateEVM,
      scroll: this.validateEVM,
      mantle: this.validateEVM,

      // Non-EVM
      solana: this.validateSolana,
      sui: this.validateSui,
      sei: this.validateCosmos,
      bitcoin: this.validateBitcoin,
      litecoin: this.validateBitcoin,
      dogecoin: this.validateBitcoin,
      cardano: this.validateCardano,
      polkadot: this.validatePolkadot,
      cosmos: this.validateCosmos,
      near: this.validateNear,
      aptos: this.validateAptos,
      tron: this.validateTron,
      ripple: this.validateRipple,
      stellar: this.validateStellar,
      algorand: this.validateAlgorand,
      tezos: this.validateTezos
    };

    return validators[network.toLowerCase()];
  }

  static validateEVM(address) {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  static validateSolana(address) {
    try {
      new solanaWeb3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  static validateSui(address) {
    if (!address.startsWith('0x')) return false;
    if (address.length !== 66) return false;
    return /^0x[0-9a-fA-F]{64}$/.test(address);
  }

  static validateBitcoin(address) {
    try {
      bitcoin.address.toOutputScript(address);
      return true;
    } catch {
      return false;
    }
  }

  static validateCosmos(address) {
    if (!address.match(/^[a-z]+1[a-z0-9]{38}$/)) return false;
    return true;
  }

  static validateCardano(address) {
    if (!address.startsWith('addr1')) return false;
    return address.length >= 58 && address.length <= 104;
  }

  static validatePolkadot(address) {
    return address.length === 47 || address.length === 48;
  }

  static validateNear(address) {
    return /^[a-z0-9_-]+\.near$/.test(address) || /^[a-f0-9]{64}$/.test(address);
  }

  static validateAptos(address) {
    if (!address.startsWith('0x')) return false;
    return /^0x[0-9a-fA-F]{64}$/.test(address);
  }

  static validateTron(address) {
    if (!address.startsWith('T')) return false;
    return address.length === 34;
  }

  static validateRipple(address) {
    if (!address.startsWith('r')) return false;
    return address.length >= 25 && address.length <= 35;
  }

  static validateStellar(address) {
    if (!address.startsWith('G')) return false;
    return address.length === 56;
  }

  static validateAlgorand(address) {
    return address.length === 58;
  }

  static validateTezos(address) {
    return address.startsWith('tz1') || address.startsWith('tz2') || address.startsWith('tz3');
  }

  static getAddressFormat(network) {
    const formats = {
      ethereum: 'EVM (0x...)',
      solana: 'Base58',
      sui: 'Hex (0x...)',
      bitcoin: 'Base58/Bech32',
      cosmos: 'Bech32',
      cardano: 'Bech32',
      polkadot: 'SS58',
      near: 'Account ID',
      aptos: 'Hex (0x...)',
      tron: 'Base58 (T...)',
      ripple: 'Base58 (r...)',
      stellar: 'Base32 (G...)',
      algorand: 'Base32',
      tezos: 'Base58 (tz...)'
    };

    return formats[network.toLowerCase()] || 'Unknown';
  }
}

export default AddressValidator;
