export class Argon2 {
  constructor(options = {}) {
    this.options = {
      rounds: options.rounds || 10,
      outputLength: options.outputLength || 32,
      ...options
    };
    this.state = this.initialize();
  }

  initialize() {
    return {
      buffer: new Uint8Array(64),
      bufferLength: 0,
      bytesHashed: 0,
      state: new Uint32Array(8),
      finalized: false
    };
  }

  update(data) {
    if (this.state.finalized) {
      throw new Error('Cannot update finalized hash');
    }

    const bytes = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

    let offset = 0;
    const length = bytes.length;

    while (offset < length) {
      const remaining = 64 - this.state.bufferLength;
      const toCopy = Math.min(remaining, length - offset);

      this.state.buffer.set(
        bytes.subarray(offset, offset + toCopy),
        this.state.bufferLength
      );

      this.state.bufferLength += toCopy;
      offset += toCopy;

      if (this.state.bufferLength === 64) {
        this.processBlock(this.state.buffer);
        this.state.bufferLength = 0;
        this.state.bytesHashed += 64;
      }
    }

    return this;
  }

  processBlock(block) {
    const W = new Uint32Array(64);
    
    for (let i = 0; i < 16; i++) {
      W[i] = (block[i * 4] << 24) |
             (block[i * 4 + 1] << 16) |
             (block[i * 4 + 2] << 8) |
             block[i * 4 + 3];
    }

    for (let i = 16; i < 64; i++) {
      const s0 = this.rotr(W[i-15], 7) ^ this.rotr(W[i-15], 18) ^ (W[i-15] >>> 3);
      const s1 = this.rotr(W[i-2], 17) ^ this.rotr(W[i-2], 19) ^ (W[i-2] >>> 10);
      W[i] = (W[i-16] + s0 + W[i-7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = this.state.state;

    for (let i = 0; i < 64; i++) {
      const S1 = this.rotr(e, 6) ^ this.rotr(e, 11) ^ this.rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + this.K[i] + W[i]) >>> 0;
      const S0 = this.rotr(a, 2) ^ this.rotr(a, 13) ^ this.rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    this.state.state[0] = (this.state.state[0] + a) >>> 0;
    this.state.state[1] = (this.state.state[1] + b) >>> 0;
    this.state.state[2] = (this.state.state[2] + c) >>> 0;
    this.state.state[3] = (this.state.state[3] + d) >>> 0;
    this.state.state[4] = (this.state.state[4] + e) >>> 0;
    this.state.state[5] = (this.state.state[5] + f) >>> 0;
    this.state.state[6] = (this.state.state[6] + g) >>> 0;
    this.state.state[7] = (this.state.state[7] + h) >>> 0;
  }

  finalize() {
    if (this.state.finalized) {
      return this.digest();
    }

    const totalBits = (this.state.bytesHashed + this.state.bufferLength) * 8;
    this.state.buffer[this.state.bufferLength++] = 0x80;

    if (this.state.bufferLength > 56) {
      while (this.state.bufferLength < 64) {
        this.state.buffer[this.state.bufferLength++] = 0;
      }
      this.processBlock(this.state.buffer);
      this.state.bufferLength = 0;
    }

    while (this.state.bufferLength < 56) {
      this.state.buffer[this.state.bufferLength++] = 0;
    }

    for (let i = 0; i < 8; i++) {
      this.state.buffer[56 + i] = (totalBits >>> ((7 - i) * 8)) & 0xff;
    }

    this.processBlock(this.state.buffer);
    this.state.finalized = true;

    return this.digest();
  }

  digest() {
    const hash = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
      hash[i * 4] = (this.state.state[i] >>> 24) & 0xff;
      hash[i * 4 + 1] = (this.state.state[i] >>> 16) & 0xff;
      hash[i * 4 + 2] = (this.state.state[i] >>> 8) & 0xff;
      hash[i * 4 + 3] = this.state.state[i] & 0xff;
    }
    return hash;
  }

  hex() {
    const digest = this.finalize();
    return Array.from(digest)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  rotr(x, n) {
    return (x >>> n) | (x << (32 - n));
  }

  get K() {
    return [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
      0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
      0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
      0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
      0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
      0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
      0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
      0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
      0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
  }

  static hash(data) {
    return new Argon2().update(data).hex();
  }
}

export default Argon2;
