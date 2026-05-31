# ASURANITY

Universal blockchain vanity address generator supporting 50+ networks.

## Features

- **50+ Blockchain Networks**: EVM, Solana, Sui, Sei, Bitcoin, and more
- **Multi-threaded Generation**: Utilizes Web Workers for parallel processing
- **Advanced Pattern Matching**: Regex, prefix, suffix, contains, custom patterns
- **Real-time Statistics**: Live performance metrics and generation stats
- **GPU Acceleration**: WebGPU support for enhanced performance
- **Batch Generation**: Generate multiple addresses simultaneously
- **Export/Import**: Save and load generation sessions
- **Dark/Light Mode**: Customizable UI themes
- **Offline Support**: Works completely offline via service workers
- **Mobile Responsive**: Optimized for all devices

## Supported Networks

### EVM Compatible
- Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Fantom, Cronos, Moonbeam, Harmony, Celo, Aurora, Gnosis, Metis, Base, zkSync, Linea, Scroll, Mantle

### Non-EVM
- Solana, Sui, Sei, Bitcoin, Litecoin, Dogecoin, Cardano, Polkadot, Cosmos, Near, Aptos, Tron, Ripple, Stellar, Algorand, Tezos, Hedera, IOTA, Nano, Zcash, Monero

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run deploy
```

## Architecture

- **Core Engine**: Multi-threaded vanity generation engine
- **Network Modules**: Blockchain-specific implementations
- **Crypto Primitives**: Optimized cryptographic functions
- **Worker Pool**: Dynamic worker management
- **UI Components**: React-based responsive interface
- **Pattern Matchers**: Advanced pattern matching algorithms
- **Optimization Layer**: Performance enhancements

## License

MIT
