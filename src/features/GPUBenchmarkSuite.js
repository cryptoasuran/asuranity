/**
 * GPU Benchmark Suite
 * Comprehensive GPU performance testing and comparison
 * Tests WebGPU, WebGL, and CPU fallback performance
 */
export class GPUBenchmarkSuite {
  constructor() {
    this.results = {
      cpu: null,
      webgl: null,
      webgpu: null,
      comparison: null
    };

    this.capabilities = {
      webgl: false,
      webgl2: false,
      webgpu: false
    };

    this.detectCapabilities();
  }

  async detectCapabilities() {
    // Check WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      this.capabilities.webgl = !!gl;

      const gl2 = canvas.getContext('webgl2');
      this.capabilities.webgl2 = !!gl2;
    } catch (e) {
      this.capabilities.webgl = false;
      this.capabilities.webgl2 = false;
    }

    // Check WebGPU
    if ('gpu' in navigator) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        this.capabilities.webgpu = !!adapter;
      } catch (e) {
        this.capabilities.webgpu = false;
      }
    }
  }

  async runFullBenchmark() {
    console.log('Starting GPU Benchmark Suite...');

    // CPU Benchmark
    this.results.cpu = await this.benchmarkCPU();

    // WebGL Benchmark
    if (this.capabilities.webgl2) {
      this.results.webgl = await this.benchmarkWebGL();
    }

    // WebGPU Benchmark
    if (this.capabilities.webgpu) {
      this.results.webgpu = await this.benchmarkWebGPU();
    }

    // Generate comparison
    this.results.comparison = this.generateComparison();

    return this.results;
  }

  async benchmarkCPU() {
    console.log('Benchmarking CPU...');

    const tests = {
      singleThread: await this.cpuSingleThreadTest(),
      multiThread: await this.cpuMultiThreadTest(),
      hashRate: await this.cpuHashRateTest(),
      memory: await this.cpuMemoryTest()
    };

    return {
      ...tests,
      score: this.calculateCPUScore(tests),
      timestamp: Date.now()
    };
  }

  async cpuSingleThreadTest() {
    const iterations = 1000000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      Math.random().toString(36).substring(2, 15);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    return {
      iterations,
      duration,
      opsPerSecond: iterations / (duration / 1000)
    };
  }

  async cpuMultiThreadTest() {
    const workerCount = navigator.hardwareConcurrency || 4;
    const iterationsPerWorker = 250000;

    const startTime = performance.now();

    const workers = [];
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        URL.createObjectURL(
          new Blob([`
            self.onmessage = (e) => {
              const iterations = e.data;
              for (let i = 0; i < iterations; i++) {
                Math.random().toString(36).substring(2, 15);
              }
              self.postMessage('done');
            };
          `], { type: 'application/javascript' })
        )
      );

      workers.push(
        new Promise(resolve => {
          worker.onmessage = () => {
            worker.terminate();
            resolve();
          };
          worker.postMessage(iterationsPerWorker);
        })
      );
    }

    await Promise.all(workers);

    const endTime = performance.now();
    const duration = endTime - startTime;
    const totalIterations = iterationsPerWorker * workerCount;

    return {
      workerCount,
      iterations: totalIterations,
      duration,
      opsPerSecond: totalIterations / (duration / 1000)
    };
  }

  async cpuHashRateTest() {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    let hashes = 0;

    while (performance.now() - startTime < duration) {
      // Simulate address generation
      const random = Math.random().toString(36).substring(2, 15);
      const hash = this.simpleHash(random);
      hashes++;
    }

    const actualDuration = performance.now() - startTime;

    return {
      hashes,
      duration: actualDuration,
      hashRate: hashes / (actualDuration / 1000)
    };
  }

  async cpuMemoryTest() {
    const sizes = [1, 10, 100, 1000]; // MB
    const results = [];

    for (const size of sizes) {
      const startTime = performance.now();

      // Allocate memory
      const array = new Array(size * 1024 * 1024 / 8);
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.random();
      }

      // Access memory
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += array[i];
      }

      const endTime = performance.now();

      results.push({
        size,
        duration: endTime - startTime,
        bandwidth: (size / ((endTime - startTime) / 1000)).toFixed(2)
      });
    }

    return results;
  }

  async benchmarkWebGL() {
    console.log('Benchmarking WebGL...');

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;

    const gl = canvas.getContext('webgl2');
    if (!gl) return null;

    const tests = {
      compute: await this.webglComputeTest(gl),
      texture: await this.webglTextureTest(gl),
      shader: await this.webglShaderTest(gl)
    };

    return {
      ...tests,
      score: this.calculateWebGLScore(tests),
      timestamp: Date.now()
    };
  }

  async webglComputeTest(gl) {
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `);

    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
      precision highp float;
      uniform float time;

      void main() {
        float result = 0.0;
        for (int i = 0; i < 1000; i++) {
          result += sin(float(i) * time);
        }
        gl_FragColor = vec4(result, result, result, 1.0);
      }
    `);

    const program = this.createProgram(gl, vertexShader, fragmentShader);

    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      gl.useProgram(program);
      gl.uniform1f(gl.getUniformLocation(program, 'time'), i / 100);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    gl.finish();
    const endTime = performance.now();

    return {
      iterations,
      duration: endTime - startTime,
      fps: iterations / ((endTime - startTime) / 1000)
    };
  }

  async webglTextureTest(gl) {
    const size = 1024;
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    const startTime = performance.now();

    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 255;
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    gl.finish();
    const endTime = performance.now();

    return {
      size,
      duration: endTime - startTime,
      bandwidth: ((size * size * 4) / 1024 / 1024) / ((endTime - startTime) / 1000)
    };
  }

  async webglShaderTest(gl) {
    const shaders = [
      { name: 'simple', complexity: 10 },
      { name: 'medium', complexity: 100 },
      { name: 'complex', complexity: 1000 }
    ];

    const results = [];

    for (const shader of shaders) {
      const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
        precision highp float;
        void main() {
          float result = 0.0;
          for (int i = 0; i < ${shader.complexity}; i++) {
            result += sin(float(i));
          }
          gl_FragColor = vec4(result, result, result, 1.0);
        }
      `);

      const startTime = performance.now();

      // Compile and link
      const program = gl.createProgram();
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      gl.finish();
      const endTime = performance.now();

      results.push({
        name: shader.name,
        complexity: shader.complexity,
        compileTime: endTime - startTime
      });
    }

    return results;
  }

  async benchmarkWebGPU() {
    console.log('Benchmarking WebGPU...');

    if (!('gpu' in navigator)) return null;

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;

    const device = await adapter.requestDevice();

    const tests = {
      compute: await this.webgpuComputeTest(device),
      buffer: await this.webgpuBufferTest(device),
      pipeline: await this.webgpuPipelineTest(device)
    };

    return {
      ...tests,
      score: this.calculateWebGPUScore(tests),
      timestamp: Date.now()
    };
  }

  async webgpuComputeTest(device) {
    const shaderCode = `
      @group(0) @binding(0) var<storage, read_write> data: array<f32>;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let index = global_id.x;
        var result: f32 = 0.0;
        for (var i: u32 = 0u; i < 1000u; i = i + 1u) {
          result = result + sin(f32(i));
        }
        data[index] = result;
      }
    `;

    const shaderModule = device.createShaderModule({ code: shaderCode });

    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main'
      }
    });

    const bufferSize = 1024 * 4;
    const buffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer } }]
    });

    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();

      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.dispatchWorkgroups(16);
      passEncoder.end();

      device.queue.submit([commandEncoder.finish()]);
    }

    await device.queue.onSubmittedWorkDone();
    const endTime = performance.now();

    return {
      iterations,
      duration: endTime - startTime,
      opsPerSecond: iterations / ((endTime - startTime) / 1000)
    };
  }

  async webgpuBufferTest(device) {
    const sizes = [1, 10, 100]; // MB

    const results = [];

    for (const size of sizes) {
      const bufferSize = size * 1024 * 1024;

      const startTime = performance.now();

      const buffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
      });

      const data = new Float32Array(bufferSize / 4);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random();
      }

      device.queue.writeBuffer(buffer, 0, data);
      await device.queue.onSubmittedWorkDone();

      const endTime = performance.now();

      results.push({
        size,
        duration: endTime - startTime,
        bandwidth: size / ((endTime - startTime) / 1000)
      });

      buffer.destroy();
    }

    return results;
  }

  async webgpuPipelineTest(device) {
    const shaderCode = `
      @vertex
      fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
      }

      @fragment
      fn fs_main() -> @location(0) vec4<f32> {
        return vec4<f32>(1.0, 0.0, 0.0, 1.0);
      }
    `;

    const startTime = performance.now();

    const shaderModule = device.createShaderModule({ code: shaderCode });

    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main'
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format: 'bgra8unorm' }]
      },
      primitive: {
        topology: 'triangle-list'
      }
    });

    const endTime = performance.now();

    return {
      compileTime: endTime - startTime
    };
  }

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  calculateCPUScore(tests) {
    const singleScore = tests.singleThread.opsPerSecond / 100000;
    const multiScore = tests.multiThread.opsPerSecond / 500000;
    const hashScore = tests.hashRate.hashRate / 50000;

    return Math.round((singleScore + multiScore + hashScore) / 3 * 100);
  }

  calculateWebGLScore(tests) {
    if (!tests) return 0;

    const computeScore = tests.compute.fps / 10;
    const textureScore = tests.texture.bandwidth / 100;

    return Math.round((computeScore + textureScore) / 2 * 100);
  }

  calculateWebGPUScore(tests) {
    if (!tests) return 0;

    const computeScore = tests.compute.opsPerSecond / 100;
    const bufferScore = tests.buffer[0].bandwidth / 100;

    return Math.round((computeScore + bufferScore) / 2 * 100);
  }

  generateComparison() {
    const comparison = {
      fastest: null,
      speedup: {},
      recommendation: null
    };

    const scores = {
      cpu: this.results.cpu?.score || 0,
      webgl: this.results.webgl?.score || 0,
      webgpu: this.results.webgpu?.score || 0
    };

    // Find fastest
    comparison.fastest = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    // Calculate speedup
    const cpuScore = scores.cpu || 1;
    comparison.speedup = {
      webgl: scores.webgl / cpuScore,
      webgpu: scores.webgpu / cpuScore
    };

    // Generate recommendation
    if (scores.webgpu > scores.webgl && scores.webgpu > scores.cpu) {
      comparison.recommendation = 'WebGPU';
    } else if (scores.webgl > scores.cpu) {
      comparison.recommendation = 'WebGL';
    } else {
      comparison.recommendation = 'CPU';
    }

    return comparison;
  }

  exportResults() {
    return {
      ...this.results,
      capabilities: this.capabilities,
      system: {
        cores: navigator.hardwareConcurrency,
        memory: navigator.deviceMemory,
        platform: navigator.platform,
        userAgent: navigator.userAgent
      },
      timestamp: Date.now()
    };
  }
}

export default GPUBenchmarkSuite;
