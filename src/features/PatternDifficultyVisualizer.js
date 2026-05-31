/**
 * Pattern Difficulty Visualizer
 * Interactive 3D visualization of pattern difficulty using Canvas/WebGL
 * Shows difficulty landscape, probability distributions, and time estimates
 */
export class PatternDifficultyVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.data = null;
    this.animation = null;
    this.rotation = 0;
    this.zoom = 1;
    this.offset = { x: 0, y: 0 };

    this.colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444',
      extreme: '#7c3aed'
    };

    this.setupInteraction();
  }

  setupInteraction() {
    let isDragging = false;
    let lastPos = { x: 0, y: 0 };

    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastPos = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;

      this.rotation += dx * 0.01;
      this.offset.y += dy;

      lastPos = { x: e.clientX, y: e.clientY };
      this.render();
    });

    this.canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.max(0.1, Math.min(5, this.zoom));
      this.render();
    });
  }

  async visualize(pattern, type, options = {}) {
    this.data = await this.generateVisualizationData(pattern, type, options);
    this.startAnimation();
  }

  async generateVisualizationData(pattern, type, options) {
    const data = {
      pattern,
      type,
      difficulty: this.calculateDifficulty(pattern, type),
      probability: this.calculateProbability(pattern, type),
      timeEstimate: this.estimateTime(pattern, type),
      distribution: this.generateDistribution(pattern, type),
      landscape: this.generateLandscape(pattern, type),
      heatmap: this.generateHeatmap(pattern, type),
      particles: this.generateParticles(pattern, type)
    };

    return data;
  }

  calculateDifficulty(pattern, type) {
    const charset = 16; // hex
    const length = pattern.length;

    switch (type) {
      case 'prefix':
      case 'suffix':
        return Math.pow(charset, length);
      case 'contains':
        return Math.pow(charset, length) / length;
      default:
        return Math.pow(charset, length);
    }
  }

  calculateProbability(pattern, type) {
    return 1 / this.calculateDifficulty(pattern, type);
  }

  estimateTime(pattern, type) {
    const difficulty = this.calculateDifficulty(pattern, type);
    const hashRate = 100000; // addresses per second
    return difficulty / hashRate;
  }

  generateDistribution(pattern, type) {
    const points = [];
    const samples = 100;

    for (let i = 0; i < samples; i++) {
      const x = (i / samples) * 10;
      const y = this.probabilityDensity(x, pattern.length);
      points.push({ x, y });
    }

    return points;
  }

  probabilityDensity(x, patternLength) {
    // Exponential distribution
    const lambda = 1 / Math.pow(16, patternLength);
    return lambda * Math.exp(-lambda * x);
  }

  generateLandscape(pattern, type) {
    const grid = [];
    const resolution = 50;

    for (let i = 0; i < resolution; i++) {
      const row = [];
      for (let j = 0; j < resolution; j++) {
        const x = (i / resolution) * 10 - 5;
        const y = (j / resolution) * 10 - 5;
        const z = this.difficultyFunction(x, y, pattern.length);
        row.push({ x, y, z });
      }
      grid.push(row);
    }

    return grid;
  }

  difficultyFunction(x, y, patternLength) {
    // 3D surface representing difficulty landscape
    const r = Math.sqrt(x * x + y * y);
    const base = Math.pow(16, patternLength);
    return Math.log(base) * Math.exp(-r / 2) * Math.cos(r);
  }

  generateHeatmap(pattern, type) {
    const heatmap = [];
    const size = 40;

    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const value = this.heatmapValue(i, j, size, pattern.length);
        row.push(value);
      }
      heatmap.push(row);
    }

    return heatmap;
  }

  heatmapValue(i, j, size, patternLength) {
    const x = (i / size) * 2 - 1;
    const y = (j / size) * 2 - 1;
    const r = Math.sqrt(x * x + y * y);

    return Math.exp(-r * patternLength) * (1 + Math.sin(r * 10));
  }

  generateParticles(pattern, type) {
    const particles = [];
    const count = 200;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: this.getColorForDepth(Math.random())
      });
    }

    return particles;
  }

  startAnimation() {
    if (this.animation) {
      cancelAnimationFrame(this.animation);
    }

    const animate = () => {
      this.rotation += 0.005;
      this.updateParticles();
      this.render();
      this.animation = requestAnimationFrame(animate);
    };

    animate();
  }

  stopAnimation() {
    if (this.animation) {
      cancelAnimationFrame(this.animation);
      this.animation = null;
    }
  }

  updateParticles() {
    if (!this.data || !this.data.particles) return;

    for (const particle of this.data.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;

      // Wrap around
      if (particle.x < 0) particle.x = this.width;
      if (particle.x > this.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.height;
      if (particle.y > this.height) particle.y = 0;
      if (particle.z < 0) particle.z = 100;
      if (particle.z > 100) particle.z = 0;
    }
  }

  render() {
    if (!this.data) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background gradient
    this.drawBackground();

    // Draw 3D landscape
    this.drawLandscape();

    // Draw distribution curve
    this.drawDistribution();

    // Draw heatmap
    this.drawHeatmap();

    // Draw particles
    this.drawParticles();

    // Draw info overlay
    this.drawInfo();
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawLandscape() {
    if (!this.data.landscape) return;

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const scale = 10 * this.zoom;

    this.ctx.save();
    this.ctx.translate(centerX, centerY + this.offset.y);

    for (let i = 0; i < this.data.landscape.length - 1; i++) {
      for (let j = 0; j < this.data.landscape[i].length - 1; j++) {
        const p1 = this.project3D(
          this.data.landscape[i][j].x,
          this.data.landscape[i][j].y,
          this.data.landscape[i][j].z,
          scale
        );

        const p2 = this.project3D(
          this.data.landscape[i + 1][j].x,
          this.data.landscape[i + 1][j].y,
          this.data.landscape[i + 1][j].z,
          scale
        );

        const p3 = this.project3D(
          this.data.landscape[i][j + 1].x,
          this.data.landscape[i][j + 1].y,
          this.data.landscape[i][j + 1].z,
          scale
        );

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineTo(p3.x, p3.y);
        this.ctx.closePath();

        const color = this.getColorForHeight(this.data.landscape[i][j].z);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  project3D(x, y, z, scale) {
    // Rotate around Y axis
    const cosR = Math.cos(this.rotation);
    const sinR = Math.sin(this.rotation);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    // Perspective projection
    const perspective = 500;
    const factor = perspective / (perspective + z1);

    return {
      x: x1 * scale * factor,
      y: y * scale * factor
    };
  }

  drawDistribution() {
    if (!this.data.distribution) return;

    const startX = 50;
    const startY = this.height - 150;
    const width = 300;
    const height = 100;

    // Draw axes
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(startX, startY - height);
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(startX + width, startY);
    this.ctx.stroke();

    // Draw curve
    this.ctx.strokeStyle = '#6366f1';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    for (let i = 0; i < this.data.distribution.length; i++) {
      const point = this.data.distribution[i];
      const x = startX + (point.x / 10) * width;
      const y = startY - point.y * height * 1000;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();

    // Label
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Probability Distribution', startX, startY + 20);
  }

  drawHeatmap() {
    if (!this.data.heatmap) return;

    const startX = this.width - 250;
    const startY = 50;
    const cellSize = 4;

    for (let i = 0; i < this.data.heatmap.length; i++) {
      for (let j = 0; j < this.data.heatmap[i].length; j++) {
        const value = this.data.heatmap[i][j];
        const color = this.getHeatmapColor(value);

        this.ctx.fillStyle = color;
        this.ctx.fillRect(
          startX + j * cellSize,
          startY + i * cellSize,
          cellSize,
          cellSize
        );
      }
    }

    // Label
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Difficulty Heatmap', startX, startY - 10);
  }

  drawParticles() {
    if (!this.data.particles) return;

    for (const particle of this.data.particles) {
      const alpha = particle.z / 100;

      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
  }

  drawInfo() {
    if (!this.data) return;

    const padding = 20;
    const lineHeight = 25;

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    this.ctx.fillRect(padding, padding, 300, 150);

    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillText(`Pattern: ${this.data.pattern}`, padding + 10, padding + 25);

    this.ctx.font = '14px monospace';
    this.ctx.fillStyle = '#94a3b8';

    this.ctx.fillText(`Type: ${this.data.type}`, padding + 10, padding + 25 + lineHeight);
    this.ctx.fillText(
      `Difficulty: ${this.data.difficulty.toExponential(2)}`,
      padding + 10,
      padding + 25 + lineHeight * 2
    );
    this.ctx.fillText(
      `Probability: ${(this.data.probability * 100).toExponential(2)}%`,
      padding + 10,
      padding + 25 + lineHeight * 3
    );
    this.ctx.fillText(
      `Est. Time: ${this.formatTime(this.data.timeEstimate)}`,
      padding + 10,
      padding + 25 + lineHeight * 4
    );
  }

  getColorForHeight(z) {
    if (z > 5) return this.colors.extreme;
    if (z > 2) return this.colors.hard;
    if (z > 0) return this.colors.medium;
    return this.colors.easy;
  }

  getColorForDepth(depth) {
    const r = Math.floor(99 + depth * 156);
    const g = Math.floor(102 + depth * 139);
    const b = Math.floor(241 - depth * 100);
    return `rgb(${r}, ${g}, ${b})`;
  }

  getHeatmapColor(value) {
    const normalized = Math.max(0, Math.min(1, value));

    if (normalized < 0.25) {
      return `rgba(16, 185, 129, ${normalized * 4})`;
    } else if (normalized < 0.5) {
      return `rgba(245, 158, 11, ${(normalized - 0.25) * 4})`;
    } else if (normalized < 0.75) {
      return `rgba(239, 68, 68, ${(normalized - 0.5) * 4})`;
    } else {
      return `rgba(124, 58, 237, ${(normalized - 0.75) * 4})`;
    }
  }

  formatTime(seconds) {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
    return `${(seconds / 86400).toFixed(1)}d`;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.render();
  }

  destroy() {
    this.stopAnimation();
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

export default PatternDifficultyVisualizer;
