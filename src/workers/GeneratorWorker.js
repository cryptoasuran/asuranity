import { ethers } from 'ethers';

let isRunning = false;
let isPaused = false;
let config = null;
let checked = 0;

self.onmessage = async (e) => {
  const { type, config: newConfig } = e.data;

  switch (type) {
    case 'start':
      config = newConfig;
      isRunning = true;
      isPaused = false;
      checked = 0;
      await startGeneration();
      break;

    case 'pause':
      isPaused = true;
      break;

    case 'resume':
      isPaused = false;
      break;

    case 'stop':
      isRunning = false;
      isPaused = false;
      break;
  }
};

async function startGeneration() {
  while (isRunning) {
    if (isPaused) {
      await sleep(100);
      continue;
    }

    await generateBatch();
  }
}

async function generateBatch() {
  const batchSize = config.batchSize || 1000;

  for (let i = 0; i < batchSize && isRunning && !isPaused; i++) {
    const result = await generateAddress();

    if (result.match) {
      self.postMessage({
        type: 'result',
        data: result
      });
    }

    checked++;

    if (checked % 1000 === 0) {
      self.postMessage({
        type: 'progress',
        data: { checked }
      });
    }
  }
}

async function generateAddress() {
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  const privateKey = wallet.privateKey;

  const match = testPattern(address);

  return {
    address,
    privateKey,
    match,
    timestamp: Date.now()
  };
}

function testPattern(address) {
  const { pattern, patternType, caseSensitive } = config;

  const addr = caseSensitive ? address : address.toLowerCase();
  const pat = caseSensitive ? pattern : pattern.toLowerCase();

  switch (patternType) {
    case 'prefix':
      return addr.slice(2).startsWith(pat);

    case 'suffix':
      return addr.endsWith(pat);

    case 'contains':
      return addr.includes(pat);

    case 'regex':
      const flags = caseSensitive ? '' : 'i';
      return new RegExp(pat, flags).test(addr);

    default:
      return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
