import { EventType, WindowBuilder } from "../mod.ts";

const width = 512;
const height = 512;
const window = new WindowBuilder("webgpu game of life", width, height).build();
const [system, windowHandle, displayHandle] = window.windowHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const context = createWindowSurface(system, windowHandle, displayHandle);
const presentationFormat = "bgra8unorm";

const computeWgsl = `
@binding(0) @group(0) var<storage, read> size: vec2<u32>;
@binding(1) @group(0) var<storage, read> current: array<u32>;
@binding(2) @group(0) var<storage, read_write> next: array<u32>;

const blockSize = 8;

fn getIndex(x: u32, y: u32) -> u32 {
  let h = size.y;
  let w = size.x;

  return (y % h) * w + (x % w);
}

fn getCell(x: u32, y: u32) -> u32 {
  return current[getIndex(x, y)];
}

fn countNeighbors(x: u32, y: u32) -> u32 {
  return getCell(x - 1u, y - 1u) + getCell(x, y - 1u) + getCell(x + 1u, y - 1u) + 
         getCell(x - 1u, y) +                         getCell(x + 1u, y) + 
         getCell(x - 1u, y + 1u) + getCell(x, y + 1u) + getCell(x + 1u, y + 1u);
}

@compute @workgroup_size(blockSize, blockSize)
fn main(@builtin(global_invocation_id) grid: vec3<u32>) {
  let x = grid.x;
  let y = grid.y;
  let n = countNeighbors(x, y);
  next[getIndex(x, y)] = select(u32(n == 3u), u32(n == 2u || n == 3u), getCell(x, y) == 1u); 
}`;

const vertexWgsl = `
struct Out {
  @builtin(position) pos: vec4<f32>,
  @location(0) cell: f32,
}

@binding(0) @group(0) var<uniform> size: vec2<u32>;

@vertex
fn main(@builtin(instance_index) i: u32, @location(0) cell: u32, @location(1) pos: vec2<u32>) -> Out {
  let w = size.x;
  let h = size.y;
  let x = (f32(i % w + pos.x) / f32(w) - 0.5) * 2. * f32(w) / f32(max(w, h));
  let y = (f32((i - (i % w)) / w + pos.y) / f32(h) - 0.5) * 2. * f32(h) / f32(max(w, h));

  return Out(vec4<f32>(x, y, 0., 1.), f32(cell));
}
`;

const fragmentWgsl = `
@fragment
fn main(@location(0) cell: f32) -> @location(0) vec4<f32> {
  return vec4<f32>(cell, cell, cell, 1.);
}`;

context.configure({
  device: device,
  format: "bgra8unorm",
  height: height,
  width: width,
});

const computeShader = device.createShaderModule({ code: computeWgsl });
const bindGroupLayoutCompute = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: "read-only-storage",
      },
    },
    {
      binding: 1,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: "read-only-storage",
      },
    },
    {
      binding: 2,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: "storage",
      },
    },
  ],
});

const GameOptions = {
  width: 128,
  height: 128,
  timestep: 4,
  workgroupSize: 8,
};
const squareVertices = new Uint32Array([0, 0, 0, 1, 1, 0, 1, 1]);
const squareBuffer = device.createBuffer({
  size: squareVertices.byteLength,
  usage: GPUBufferUsage.VERTEX,
  mappedAtCreation: true,
});
new Uint32Array(squareBuffer.getMappedRange()).set(squareVertices);
squareBuffer.unmap();

const squareStride: GPUVertexBufferLayout = {
  arrayStride: 2 * squareVertices.BYTES_PER_ELEMENT,
  stepMode: "vertex",
  attributes: [
    {
      shaderLocation: 1,
      offset: 0,
      format: "uint32x2",
    },
  ],
};

const vertexShader = device.createShaderModule({ code: vertexWgsl });
const fragmentShader = device.createShaderModule({ code: fragmentWgsl });
let commandEncoder: GPUCommandEncoder;

const bindGroupLayoutRender = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.VERTEX,
      buffer: {
        type: "uniform",
      },
    },
  ],
});

const cellsStride: GPUVertexBufferLayout = {
  arrayStride: Uint32Array.BYTES_PER_ELEMENT,
  stepMode: "instance",
  attributes: [
    {
      shaderLocation: 0,
      offset: 0,
      format: "uint32",
    },
  ],
};

let wholeTime = 0,
  loopTimes = 0,
  buffer0: GPUBuffer,
  buffer1: GPUBuffer;
let render: () => void;
function resetGameData() {
  // compute pipeline
  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayoutCompute],
    }),
    compute: {
      module: computeShader,
      entryPoint: "main",
      constants: {
        blockSize: GameOptions.workgroupSize,
      },
    },
  });
  const sizeBuffer = device.createBuffer({
    size: 2 * Uint32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE |
      GPUBufferUsage.UNIFORM |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Uint32Array(sizeBuffer.getMappedRange()).set([
    GameOptions.width,
    GameOptions.height,
  ]);
  sizeBuffer.unmap();
  const length = GameOptions.width * GameOptions.height;
  const cells = new Uint32Array(length);
  for (let i = 0; i < length; i++) {
    cells[i] = Math.random() < 0.25 ? 1 : 0;
  }

  buffer0 = device.createBuffer({
    size: cells.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Uint32Array(buffer0.getMappedRange()).set(cells);
  buffer0.unmap();

  buffer1 = device.createBuffer({
    size: cells.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
  });

  const bindGroup0 = device.createBindGroup({
    layout: bindGroupLayoutCompute,
    entries: [
      { binding: 0, resource: { buffer: sizeBuffer } },
      { binding: 1, resource: { buffer: buffer0 } },
      { binding: 2, resource: { buffer: buffer1 } },
    ],
  });

  const bindGroup1 = device.createBindGroup({
    layout: bindGroupLayoutCompute,
    entries: [
      { binding: 0, resource: { buffer: sizeBuffer } },
      { binding: 1, resource: { buffer: buffer1 } },
      { binding: 2, resource: { buffer: buffer0 } },
    ],
  });

  const renderPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayoutRender],
    }),
    primitive: {
      topology: "triangle-strip",
    },
    vertex: {
      module: vertexShader,
      entryPoint: "main",
      buffers: [cellsStride, squareStride],
    },
    fragment: {
      module: fragmentShader,
      entryPoint: "main",
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
  });

  const uniformBindGroup = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: sizeBuffer,
          offset: 0,
          size: 2 * Uint32Array.BYTES_PER_ELEMENT,
        },
      },
    ],
  });

  loopTimes = 0;
  render = () => {
    const view = context.getCurrentTexture().createView();
    const renderPass: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view,
          loadOp: "clear",
          storeOp: "store",
          clearColor: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    };
    commandEncoder = device.createCommandEncoder();

    // compute
    const passEncoderCompute = commandEncoder.beginComputePass();
    passEncoderCompute.setPipeline(computePipeline);
    passEncoderCompute.setBindGroup(0, loopTimes ? bindGroup1 : bindGroup0);
    passEncoderCompute.dispatchWorkgroups(
      GameOptions.width / GameOptions.workgroupSize,
      GameOptions.height / GameOptions.workgroupSize,
    );
    passEncoderCompute.end();
    // render
    const passEncoderRender = commandEncoder.beginRenderPass(renderPass);
    passEncoderRender.setPipeline(renderPipeline);
    passEncoderRender.setVertexBuffer(0, loopTimes ? buffer1 : buffer0);
    passEncoderRender.setVertexBuffer(1, squareBuffer);
    passEncoderRender.setBindGroup(0, uniformBindGroup);
    passEncoderRender.draw(4, length);
    passEncoderRender.end();

    device.queue.submit([commandEncoder.finish()]);
    context.present();
  };
}

resetGameData();

for (const event of window.events()) {
  if (event.type === EventType.Quit) {
    break;
  } else if (event.type === EventType.Draw) {
    wholeTime++;
    if (wholeTime >= GameOptions.timestep) {
      render();
      wholeTime -= GameOptions.timestep;
      loopTimes = 1 - loopTimes;
    }
  }
}
