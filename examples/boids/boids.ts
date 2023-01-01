import { Canvas, PixelFormat, Texture, TextureAccess, WindowBuilder, EventType } from "../../mod.ts";
import { FPS } from "../utils.ts";

class Boids {
  particleCount: number;
  particlesPerGroup: number;

  computePipeline!: GPUComputePipeline;
  particleBindGroups: GPUBindGroup[] = [];
  renderPipeline!: GPURenderPipeline;
  particleBuffers: GPUBuffer[] = [];
  verticesBuffer!: GPUBuffer;

  frameNum = 0;
  dimensions = {
    width: 800,
    height: 800,
  };
  screenDimensions = {
    width: 800,
    height: 800,
  };
  texture: GPUTexture;
  outputBuffer: GPUBuffer;

  canvas: Canvas;
  sdl2texture: Texture;
  window: Window;
  constructor(options: {
    particleCount: number;
    particlesPerGroup: number;
  }, public device: GPUDevice) {
    this.particleCount = options.particleCount;
    this.particlesPerGroup = options.particlesPerGroup;
    const window = new WindowBuilder("Hello, Deno!" , this.dimensions.width, this.dimensions.height).build();
    this.canvas = window.canvas();
    this.window = window;
    const creator = this.canvas.textureCreator();
    this.sdl2texture = creator.createTexture(
      PixelFormat.ABGR8888,
      TextureAccess.Streaming,
      this.dimensions.width,
      this.dimensions.height,
    );
        this.texture = this.device.createTexture({
      label: "Capture",
      size: this.dimensions,
      format: "rgba8unorm-srgb",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });
    const { padded, unpadded } = getRowPadding(this.dimensions.width);
    this.outputBuffer = this.device.createBuffer({
      label: "Capture",
      size: padded * this.dimensions.height,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
  }

  init() {
    const computeShader = this.device.createShaderModule({
      code: Deno.readTextFileSync(new URL("./compute.wgsl", import.meta.url)),
    });

    const drawShader = this.device.createShaderModule({
      code: Deno.readTextFileSync(new URL("./shader.wgsl", import.meta.url)),
    });

    const simParamData = new Float32Array([
      0.1, // deltaT
      0.2, // rule1Distance
      0.2, // rule2Distance
      0.2, // rule3Distance
      0.7, // rule1Scale
      0.3, // rule2Scale
      0.5, // rule3Scale
    ]);

    const simParamBuffer = createBufferInit(this.device, {
      label: "Simulation Parameter Buffer",
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      contents: simParamData.buffer,
    });

    const computeBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            minBindingSize: simParamData.length * 4,
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "read-only-storage",
            minBindingSize: this.particleCount * 16,
          },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
            minBindingSize: this.particleCount * 16,
          },
        },
      ],
    });
    const computePipelineLayout = this.device.createPipelineLayout({
      label: "compute",
      bindGroupLayouts: [computeBindGroupLayout],
    });
    const renderPipelineLayout = this.device.createPipelineLayout({
      label: "render",
      bindGroupLayouts: [],
    });
    this.renderPipeline = this.device.createRenderPipeline({
      layout: renderPipelineLayout,
      vertex: {
        module: drawShader,
        entryPoint: "main",
        buffers: [
          {
            arrayStride: 4 * 4,
            stepMode: "instance",
            attributes: [
              {
                format: "float32x2",
                offset: 0,
                shaderLocation: 0,
              },
              {
                format: "float32x2",
                offset: 8,
                shaderLocation: 1,
              },
            ],
          },
          {
            arrayStride: 2 * 4,
            attributes: [
              {
                format: "float32x2",
                offset: 0,
                shaderLocation: 2,
              },
            ],
          },
        ],
      },
      fragment: {
        module: drawShader,
        entryPoint: "main",
        targets: [
          {
            format: "rgba8unorm-srgb",
          },
        ],
      },
    });
    this.computePipeline = this.device.createComputePipeline({
      label: "Compute pipeline",
      layout: computePipelineLayout,
      compute: {
        module: computeShader,
        entryPoint: "main",
      },
    });
    const vertexBufferData = new Float32Array([
      -0.01,
      -0.02,
      0.01,
      -0.02,
      0.00,
      0.02,
    ]);
    this.verticesBuffer = createBufferInit(this.device, {
      label: "Vertex Buffer",
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      contents: vertexBufferData.buffer,
    });

    const initialParticleData = new Float32Array(4 * this.particleCount);
    for (let i = 0; i < initialParticleData.length; i += 4) {
      initialParticleData[i] = 2.0 * (Math.random() - 0.5); // posx
      initialParticleData[i + 1] = 2.0 * (Math.random() - 0.5); // posy
      initialParticleData[i + 2] = 2.0 * (Math.random() - 0.5) * 0.1; // velx
      initialParticleData[i + 3] = 2.0 * (Math.random() - 0.5) * 0.1;
    }

    for (let i = 0; i < 2; i++) {
      this.particleBuffers.push(createBufferInit(this.device, {
        label: "Particle Buffer " + i,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE |
          GPUBufferUsage.COPY_DST,
        contents: initialParticleData.buffer,
      }));
    }

    for (let i = 0; i < 2; i++) {
      this.particleBindGroups.push(this.device.createBindGroup({
        layout: computeBindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: {
              buffer: simParamBuffer,
            },
          },
          {
            binding: 1,
            resource: {
              buffer: this.particleBuffers[i],
            },
          },
          {
            binding: 2,
            resource: {
              buffer: this.particleBuffers[(i + 1) % 2],
            },
          },
        ],
      }));
    }
  }

  render(encoder: GPUCommandEncoder, view: GPUTextureView) {
    encoder.pushDebugGroup("compute boid movement");
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.particleBindGroups[this.frameNum % 2]);
    computePass.dispatch(
      Math.ceil(this.particleCount / this.particlesPerGroup),
    );
    computePass.endPass();
    encoder.copyBufferToBuffer(
      this.particleBuffers[0],
      0,
      this.particleBuffers[1],
      0,
      16,
    );
    encoder.popDebugGroup();

    encoder.pushDebugGroup("render boids");
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: view,
          storeOp: "store",
          loadValue: [0, 0, 0, 1],
        },
      ],
    });
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setVertexBuffer(
      0,
      this.particleBuffers[(this.frameNum + 1) % 2],
    );
    renderPass.setVertexBuffer(1, this.verticesBuffer);
    renderPass.draw(3, this.particleCount);
    renderPass.endPass();
    encoder.popDebugGroup();

    this.frameNum += 1;
  }

  async update() {
    const encoder = this.device.createCommandEncoder();
    const { padded, unpadded } = getRowPadding(this.dimensions.width);
    this.render(encoder, this.texture.createView());
    // const outputBuffer = this.device.createBuffer({
    //     label: "Capture",
    //     size: padded * this.dimensions.height,
    //     usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    // });
    encoder.copyTextureToBuffer(
      { texture: this.texture },
      {
        buffer: this.outputBuffer,
        bytesPerRow: padded,
        rowsPerImage: 0,
      },
      this.dimensions,
    );
    this.device.queue.submit([encoder.finish()]);
    await this.outputBuffer.mapAsync(1);
    const buf = new Uint8Array(this.outputBuffer.getMappedRange());
    const buffer = new Uint8Array(unpadded * this.dimensions.height);
    for (let i = 0; i < this.dimensions.height; i++) {
      const slice = buf
        .slice(i * padded, (i + 1) * padded)
        .slice(0, unpadded);

      buffer.set(slice, i * unpadded);
    }
    this.sdl2texture.update(buffer, this.dimensions.width * 4);
    const rect = { x: 0, y: 0, ...this.dimensions };
    const screen = { x: 0, y: 0, ...this.screenDimensions };
    this.canvas.copy(this.sdl2texture, rect, screen);
    this.canvas.present();
    this.outputBuffer.unmap();
  }
}

async function getDevice(features: GPUFeatureName[] = []): Promise<GPUDevice> {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice({
    requiredFeatures: features,
  });

  if (!device) {
    throw new Error("no suitable adapter found");
  }

  return device;
}

export function createBufferInit(
  device: GPUDevice,
  descriptor: BufferInit,
): GPUBuffer {
  const contents = new Uint8Array(descriptor.contents);

  const unpaddedSize = contents.byteLength;
  const padding = 4 - unpaddedSize % 4;
  const paddedSize = padding + unpaddedSize;

  const buffer = device.createBuffer({
    label: descriptor.label,
    usage: descriptor.usage,
    mappedAtCreation: true,
    size: paddedSize,
  });
  const data = new Uint8Array(buffer.getMappedRange());
  data.set(contents);
  buffer.unmap();
  return buffer;
}

interface BufferInit {
  label?: string;
  usage: number;
  contents: ArrayBuffer;
}

function getRowPadding(width: number) {
  const bytesPerPixel = 4;
  const unpaddedBytesPerRow = width * bytesPerPixel;
  const align = 256;
  const paddedBytesPerRowPadding = (align - unpaddedBytesPerRow % align) %
    align;
  const paddedBytesPerRow = unpaddedBytesPerRow + paddedBytesPerRowPadding;

  return {
    unpadded: unpaddedBytesPerRow,
    padded: paddedBytesPerRow,
  };
}

const boids = new Boids({
  particleCount: 100,
  particlesPerGroup: 64,
}, await getDevice());
boids.init();

const tick = FPS(100);

event_loop:
for (const event of boids.window.events()) {
  switch (event.type) {
    // case EventType.Re: {
    //   const { width, height } = event;
    //   boids.canvas.copy(boids.sdl2texture, { x: 0, y: 0, width, height }, {
    //     x: 0,
    //     y: 0,
    //     width,
    //     height,
    //   });
    //   boids.screenDimensions = { width, height };
    //   boids.canvas.present();
    //   break;
    // }
    case EventType.Draw: {
      await boids.update();
      tick();
      break;
    }
    case EventType.Quit:
      break event_loop;
    case EventType.KeyDown:
      break event_loop;
    default:
      break;
  }
}
