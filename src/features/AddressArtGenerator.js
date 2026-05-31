/**
 * Address Art Generator
 * Converts blockchain addresses into unique visual art
 * Supports multiple art styles: geometric, organic, pixel, abstract
 */
export class AddressArtGenerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.styles = {
      geometric: this.generateGeometric.bind(this),
      organic: this.generateOrganic.bind(this),
      pixel: this.generatePixel.bind(this),
      abstract: this.generateAbstract.bind(this),
      mandala: this.generateMandala.bind(this),
      wave: this.generateWave.bind(this),
      spiral: this.generateSpiral.bind(this),
      fractal: this.generateFractal.bind(this)
    };
  }

  async generate(address, style = 'geometric', options = {}) {
    const seed = this.addressToSeed(address);
    const generator = this.styles[style];

    if (!generator) {
      throw new Error(`Unknown style: ${style}`);
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    await generator(seed, options);

    return this.canvas.toDataURL('image/png');
  }

  addressToSeed(address) {
    // Convert address to deterministic seed
    const cleaned = address.replace(/^0x/, '').toLowerCase();
    const bytes = [];

    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(parseInt(cleaned.substr(i, 2), 16));
    }

    return {
      bytes,
      hash: this.hashBytes(bytes),
      colors: this.extractColors(bytes),
      patterns: this.extractPatterns(bytes),
      symmetry: this.extractSymmetry(bytes)
    };
  }

  hashBytes(bytes) {
    let hash = 0;
    for (const byte of bytes) {
      hash = ((hash << 5) - hash) + byte;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  extractColors(bytes) {
    const colors = [];

    for (let i = 0; i < Math.min(bytes.length, 15); i += 3) {
      const r = bytes[i] || 0;
      const g = bytes[i + 1] || 0;
      const b = bytes[i + 2] || 0;
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    return colors;
  }

  extractPatterns(bytes) {
    return {
      complexity: (bytes[0] % 10) + 5,
      density: (bytes[1] % 100) / 100,
      rotation: (bytes[2] % 360),
      scale: (bytes[3] % 50) / 50 + 0.5,
      iterations: (bytes[4] % 20) + 10
    };
  }

  extractSymmetry(bytes) {
    return {
      radial: bytes[5] % 12 + 3,
      mirror: bytes[6] % 2 === 0,
      rotational: bytes[7] % 4 + 1
    };
  }

  async generateGeometric(seed, options) {
    const { colors, patterns, symmetry } = seed;

    // Background
    this.ctx.fillStyle = colors[0];
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Draw geometric shapes based on address
    for (let i = 0; i < patterns.complexity; i++) {
      const angle = (i / patterns.complexity) * Math.PI * 2;
      const radius = (this.width / 3) * (1 - i / patterns.complexity);

      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(angle + patterns.rotation);

      // Draw shape
      const shapeType = seed.bytes[i % seed.bytes.length] % 4;

      this.ctx.fillStyle = colors[i % colors.length];
      this.ctx.globalAlpha = 0.7;

      switch (shapeType) {
        case 0: // Circle
          this.ctx.beginPath();
          this.ctx.arc(radius, 0, 30 * patterns.scale, 0, Math.PI * 2);
          this.ctx.fill();
          break;

        case 1: // Square
          this.ctx.fillRect(radius - 20, -20, 40 * patterns.scale, 40 * patterns.scale);
          break;

        case 2: // Triangle
          this.ctx.beginPath();
          this.ctx.moveTo(radius, -20 * patterns.scale);
          this.ctx.lineTo(radius + 20 * patterns.scale, 20 * patterns.scale);
          this.ctx.lineTo(radius - 20 * patterns.scale, 20 * patterns.scale);
          this.ctx.closePath();
          this.ctx.fill();
          break;

        case 3: // Pentagon
          this.drawPolygon(radius, 0, 25 * patterns.scale, 5);
          this.ctx.fill();
          break;
      }

      this.ctx.restore();
    }

    // Add symmetry
    if (symmetry.mirror) {
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.translate(-this.width, 0);
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(this.canvas, 0, 0);
      this.ctx.restore();
    }
  }

  async generateOrganic(seed, options) {
    const { colors, patterns } = seed;

    // Background gradient
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, this.width / 2
    );
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw organic curves
    for (let i = 0; i < patterns.iterations; i++) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = colors[i % colors.length];
      this.ctx.lineWidth = 2 + (seed.bytes[i] % 5);
      this.ctx.globalAlpha = 0.6;

      const startX = (seed.bytes[i * 2] / 255) * this.width;
      const startY = (seed.bytes[i * 2 + 1] / 255) * this.height;

      this.ctx.moveTo(startX, startY);

      for (let j = 0; j < 10; j++) {
        const idx = (i * 10 + j) % seed.bytes.length;
        const x = (seed.bytes[idx] / 255) * this.width;
        const y = (seed.bytes[(idx + 1) % seed.bytes.length] / 255) * this.height;
        const cpX = (seed.bytes[(idx + 2) % seed.bytes.length] / 255) * this.width;
        const cpY = (seed.bytes[(idx + 3) % seed.bytes.length] / 255) * this.height;

        this.ctx.quadraticCurveTo(cpX, cpY, x, y);
      }

      this.ctx.stroke();
    }
  }

  async generatePixel(seed, options) {
    const { colors, patterns } = seed;
    const pixelSize = 20;
    const cols = Math.floor(this.width / pixelSize);
    const rows = Math.floor(this.height / pixelSize);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const idx = (i * cols + j) % seed.bytes.length;
        const value = seed.bytes[idx];

        if (value > 128) {
          this.ctx.fillStyle = colors[value % colors.length];
          this.ctx.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Add grid
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= rows; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * pixelSize);
      this.ctx.lineTo(this.width, i * pixelSize);
      this.ctx.stroke();
    }

    for (let j = 0; j <= cols; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(j * pixelSize, 0);
      this.ctx.lineTo(j * pixelSize, this.height);
      this.ctx.stroke();
    }
  }

  async generateAbstract(seed, options) {
    const { colors, patterns } = seed;

    // Background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw abstract shapes
    for (let i = 0; i < patterns.iterations * 2; i++) {
      const x = (seed.bytes[i * 2] / 255) * this.width;
      const y = (seed.bytes[i * 2 + 1] / 255) * this.height;
      const size = (seed.bytes[(i * 2 + 2) % seed.bytes.length] / 255) * 100 + 20;

      this.ctx.fillStyle = colors[i % colors.length];
      this.ctx.globalAlpha = 0.3;

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Add noise
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (seed.bytes[i % seed.bytes.length] - 128) * 0.1;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  async generateMandala(seed, options) {
    const { colors, patterns, symmetry } = seed;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Background
    this.ctx.fillStyle = colors[0];
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw mandala layers
    const layers = symmetry.radial;

    for (let layer = 0; layer < 5; layer++) {
      const radius = (this.width / 2) * (1 - layer / 5);

      for (let i = 0; i < layers; i++) {
        const angle = (i / layers) * Math.PI * 2;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angle);

        this.ctx.fillStyle = colors[(layer + i) % colors.length];
        this.ctx.globalAlpha = 0.7;

        // Draw petal
        this.ctx.beginPath();
        this.ctx.ellipse(radius, 0, 30, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
      }
    }

    // Center circle
    this.ctx.fillStyle = colors[colors.length - 1];
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    this.ctx.fill();
  }

  async generateWave(seed, options) {
    const { colors, patterns } = seed;

    // Background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw waves
    for (let i = 0; i < patterns.complexity; i++) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = colors[i % colors.length];
      this.ctx.lineWidth = 3;
      this.ctx.globalAlpha = 0.6;

      const amplitude = (seed.bytes[i] / 255) * 50 + 20;
      const frequency = (seed.bytes[(i + 1) % seed.bytes.length] / 255) * 0.05 + 0.01;
      const phase = (seed.bytes[(i + 2) % seed.bytes.length] / 255) * Math.PI * 2;
      const yOffset = (i / patterns.complexity) * this.height;

      for (let x = 0; x < this.width; x++) {
        const y = yOffset + Math.sin(x * frequency + phase) * amplitude;

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.stroke();
    }
  }

  async generateSpiral(seed, options) {
    const { colors, patterns } = seed;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw spiral
    this.ctx.beginPath();
    this.ctx.strokeStyle = colors[0];
    this.ctx.lineWidth = 2;

    const maxRadius = this.width / 2;
    const turns = patterns.complexity;

    for (let i = 0; i < 1000; i++) {
      const t = i / 1000;
      const angle = t * turns * Math.PI * 2;
      const radius = t * maxRadius;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      // Change color along spiral
      if (i % 100 === 0) {
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.strokeStyle = colors[(i / 100) % colors.length];
        this.ctx.moveTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  async generateFractal(seed, options) {
    const { colors, patterns } = seed;

    // Background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw fractal tree
    const drawBranch = (x, y, length, angle, depth) => {
      if (depth === 0) return;

      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = colors[depth % colors.length];
      this.ctx.lineWidth = depth;
      this.ctx.stroke();

      const angleOffset = (seed.bytes[depth] / 255) * Math.PI / 4;

      drawBranch(endX, endY, length * 0.7, angle - angleOffset, depth - 1);
      drawBranch(endX, endY, length * 0.7, angle + angleOffset, depth - 1);
    };

    drawBranch(
      this.width / 2,
      this.height,
      this.height / 4,
      -Math.PI / 2,
      Math.min(patterns.complexity, 10)
    );
  }

  drawPolygon(x, y, radius, sides) {
    this.ctx.beginPath();

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }

    this.ctx.closePath();
  }

  async generateAll(address) {
    const results = {};

    for (const style of Object.keys(this.styles)) {
      results[style] = await this.generate(address, style);
    }

    return results;
  }

  exportSVG(address, style = 'geometric') {
    // Convert canvas to SVG
    const seed = this.addressToSeed(address);
    // SVG generation logic here
    return `<svg width="${this.width}" height="${this.height}">...</svg>`;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

export default AddressArtGenerator;
