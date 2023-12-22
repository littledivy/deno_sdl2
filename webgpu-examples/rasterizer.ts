// https://github.com/OmarShehata/webgpu-compute-rasterizer

import { mat4, vec3, vec4 } from "npm:gl-matrix";
import { EventType, WindowBuilder } from "../mod.ts";

const computeRasterizerWGSL = `
struct ColorBuffer {
  values: array<atomic<u32>>,
};

struct UBO {
  screenWidth: f32,
  screenHeight: f32,
  modelViewProjectionMatrix: mat4x4<f32>,
};

struct Vertex { x: f32, y: f32, z: f32, };

struct VertexBuffer {
  values: array<Vertex>,
};

@group(0) @binding(0) var<storage, read_write> outputColorBuffer : ColorBuffer;
@group(0) @binding(1) var<storage, read> vertexBuffer : VertexBuffer;
@group(0) @binding(2) var<uniform> uniforms : UBO;

// From: https://github.com/ssloy/tinyrenderer/wiki/Lesson-2:-Triangle-rasterization-and-back-face-culling
fn barycentric(v1: vec3<f32>, v2: vec3<f32>, v3: vec3<f32>, p: vec2<f32>) -> vec3<f32> {
  let u = cross(
    vec3<f32>(v3.x - v1.x, v2.x - v1.x, v1.x - p.x), 
    vec3<f32>(v3.y - v1.y, v2.y - v1.y, v1.y - p.y)
  );

  if (abs(u.z) < 1.0) {
    return vec3<f32>(-1.0, 1.0, 1.0);
  }

  return vec3<f32>(1.0 - (u.x+u.y)/u.z, u.y/u.z, u.x/u.z); 
}

fn get_min_max(v1: vec3<f32>, v2: vec3<f32>, v3: vec3<f32>) -> vec4<f32> {
  var min_max = vec4<f32>();
  min_max.x = min(min(v1.x, v2.x), v3.x);
  min_max.y = min(min(v1.y, v2.y), v3.y);
  min_max.z = max(max(v1.x, v2.x), v3.x);
  min_max.w = max(max(v1.y, v2.y), v3.y);

  return min_max;
}

fn color_pixel(x: u32, y: u32, r: u32, g: u32, b: u32) {
  let pixelID = u32(x + y * u32(uniforms.screenWidth)) * 3u;
  
  atomicMin(&outputColorBuffer.values[pixelID + 0u], r);
  atomicMin(&outputColorBuffer.values[pixelID + 1u], g);
  atomicMin(&outputColorBuffer.values[pixelID + 2u], b);
}

fn draw_triangle(v1: vec3<f32>, v2: vec3<f32>, v3: vec3<f32>) {
  let min_max = get_min_max(v1, v2, v3);
  let startX = u32(min_max.x);
  let startY = u32(min_max.y);
  let endX = u32(min_max.z);
  let endY = u32(min_max.w);

  for (var x: u32 = startX; x <= endX; x = x + 1u) {
    for (var y: u32 = startY; y <= endY; y = y + 1u) {
      let bc = barycentric(v1, v2, v3, vec2<f32>(f32(x), f32(y))); 
      let color = (bc.x * v1.z + bc.y * v2.z + bc.z * v3.z) * 50.0 - 400.0;

      let R = color;
      let G = color;
      let B = color;

      if (bc.x < 0.0 || bc.y < 0.0 || bc.z < 0.0) {
        continue;
      }
      color_pixel(x, y, u32(R), u32(G), u32(B));
    }
  }
}

fn draw_line(v1: vec3<f32>, v2: vec3<f32>) {
  let v1Vec = vec2<f32>(v1.x, v1.y);
  let v2Vec = vec2<f32>(v2.x, v2.y);

  let dist = i32(distance(v1Vec, v2Vec));
  for (var i = 0; i < dist; i = i + 1) {
    let x = u32(v1.x + f32(v2.x - v1.x) * (f32(i) / f32(dist)));
    let y = u32(v1.y + f32(v2.y - v1.y) * (f32(i) / f32(dist)));
    color_pixel(x, y, 255u, 255u, 255u);
  }
}

fn project(v: Vertex) -> vec3<f32> {
  var screenPos = uniforms.modelViewProjectionMatrix * vec4<f32>(v.x, v.y, v.z, 1.0);
  screenPos.x = (screenPos.x / screenPos.w) * uniforms.screenWidth;
  screenPos.y = (screenPos.y / screenPos.w) * uniforms.screenHeight;

  return vec3<f32>(screenPos.x, screenPos.y, screenPos.w);
}

fn is_off_screen(v: vec3<f32>) -> bool {
  if (v.x < 0.0 || v.x > uniforms.screenWidth || v.y < 0.0 || v.y > uniforms.screenHeight) {
    return true;
  }

  return false;
}

@compute @workgroup_size(256, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let index = global_id.x * 3u;

  let v1 = project(vertexBuffer.values[index + 0u]);
  let v2 = project(vertexBuffer.values[index + 1u]);
  let v3 = project(vertexBuffer.values[index + 2u]);

  if (is_off_screen(v1) || is_off_screen(v2) || is_off_screen(v3)) {
    return;
  }

  draw_triangle(v1, v2, v3);
}


@compute @workgroup_size(256, 1)
fn clear(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let index = global_id.x * 3u;

  atomicStore(&outputColorBuffer.values[index + 0u], 255u);
  atomicStore(&outputColorBuffer.values[index + 1u], 255u);
  atomicStore(&outputColorBuffer.values[index + 2u], 255u);
}
`;

const fullscreenQuadWGSL = `
struct ColorData {
  data : array<u32>,
};

struct Uniforms {
  screenWidth: f32,
  screenHeight: f32,
};

@group(0) @binding(0) var<uniform> uniforms : Uniforms;
@group(0) @binding(1) var<storage, read> finalColorBuffer : ColorData;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>,
};

@vertex
fn vert_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
  var pos = array<vec2<f32>, 6>(
      vec2<f32>( 1.0,  1.0),
      vec2<f32>( 1.0, -1.0),
      vec2<f32>(-1.0, -1.0),
      vec2<f32>( 1.0,  1.0),
      vec2<f32>(-1.0, -1.0),
      vec2<f32>(-1.0,  1.0));

  var output : VertexOutput;
  output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
  return output;
}

@fragment
fn frag_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
  let X = floor(coord.x);
  let Y = floor(coord.y);
  let index = u32(X + Y * uniforms.screenWidth) * 3u;

  let R = f32(finalColorBuffer.data[index + 0u]) / 255.0;
  let G = f32(finalColorBuffer.data[index + 1u]) / 255.0;
  let B = f32(finalColorBuffer.data[index + 2u]) / 255.0;

  let finalColor = vec4<f32>(R, G, B, 1.0);
  return finalColor;
}
`;

init();

const width = 640;
const height = 480;
const window = new WindowBuilder("Hello, Deno!", width, height).build();
const [system, windowHandle, displayHandle] = window.windowHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);

import { WebIO } from "npm:@gltf-transform/core";

async function init() {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const context = createWindowSurface(system, windowHandle, displayHandle);

  const devicePixelRatio = window.devicePixelRatio || 1;
  const presentationSize = [
    Math.floor(width * devicePixelRatio),
    Math.floor(height * devicePixelRatio),
  ];

  const presentationFormat = "bgra8unorm";
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "opaque",
    width,
    height,
  });

  async function loadModel() {
    const modelUrl =
      "https://github.com/OmarShehata/webgpu-compute-rasterizer/raw/main/models/suzanne.glb";
    const io = new WebIO({ credentials: "include" });
    const doc = await io.read(modelUrl);

    const positions = doc.getRoot().listMeshes()[0].listPrimitives()[0]
      .getAttribute("POSITION").getArray();
    const indices = doc.getRoot().listMeshes()[0].listPrimitives()[0]
      .getIndices().getArray();
    const finalPositions = [];

    for (let i = 0; i < indices.length; i++) {
      const index1 = indices[i] * 3 + 0;
      const index2 = indices[i] * 3 + 1;
      const index3 = indices[i] * 3 + 2;

      finalPositions.push(positions[index1]);
      finalPositions.push(positions[index2]);
      finalPositions.push(positions[index3]);
    }
    return new Float32Array(finalPositions);
  }

  const verticesArray = await loadModel();

  const { addComputePass, outputColorBuffer } = createComputePass(
    presentationSize,
    device,
    verticesArray,
  );
  const { addFullscreenPass } = createFullscreenPass(
    presentationFormat,
    device,
    presentationSize,
    outputColorBuffer,
  );

  setInterval(function () {
    const event = window.events().next().value;
    if (event.type === EventType.Quit) {
      Deno.exit(0);
    }

    const commandEncoder = device.createCommandEncoder();

    addComputePass(commandEncoder);
    addFullscreenPass(context, commandEncoder);

    device.queue.submit([commandEncoder.finish()]);
    context.present();
  });
}

function createFullscreenPass(
  presentationFormat,
  device,
  presentationSize,
  finalColorBuffer,
) {
  const fullscreenQuadBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: "uniform",
        },
      },
      {
        binding: 1, // the color buffer
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: "read-only-storage",
        },
      },
    ],
  });

  const fullscreenQuadPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [fullscreenQuadBindGroupLayout],
    }),
    vertex: {
      module: device.createShaderModule({
        code: fullscreenQuadWGSL,
      }),
      entryPoint: "vert_main",
    },
    fragment: {
      module: device.createShaderModule({
        code: fullscreenQuadWGSL,
      }),
      entryPoint: "frag_main",
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const uniformBufferSize = 4 * 2; // screen width & height
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const fullscreenQuadBindGroup = device.createBindGroup({
    layout: fullscreenQuadBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: finalColorBuffer,
        },
      },
    ],
  });

  const renderPassDescriptor = {
    colorAttachments: [
      {
        view: undefined, // Assigned later

        clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  const addFullscreenPass = (context, commandEncoder) => {
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      new Float32Array([presentationSize[0], presentationSize[1]]),
    );

    renderPassDescriptor.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(fullscreenQuadPipeline);
    passEncoder.setBindGroup(0, fullscreenQuadBindGroup);
    passEncoder.draw(6, 1, 0, 0);
    passEncoder.end();
  };

  return { addFullscreenPass };
}

function createComputePass(presentationSize, device, verticesArray) {
  const WIDTH = presentationSize[0];
  const HEIGHT = presentationSize[1];
  const COLOR_CHANNELS = 3;

  const NUMBERS_PER_VERTEX = 3;
  const vertexCount = verticesArray.length / NUMBERS_PER_VERTEX;
  const verticesBuffer = device.createBuffer({
    size: verticesArray.byteLength,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });
  new Float32Array(verticesBuffer.getMappedRange()).set(verticesArray);
  verticesBuffer.unmap();

  const outputColorBufferSize = Uint32Array.BYTES_PER_ELEMENT *
    (WIDTH * HEIGHT) * COLOR_CHANNELS;
  const outputColorBuffer = device.createBuffer({
    size: outputColorBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const UBOBufferSize = 4 * 2 + // screen width & height
    4 * 16 + // 4x4 matrix
    8; // extra padding for alignment
  const UBOBuffer = device.createBuffer({
    size: UBOBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
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
          type: "uniform",
        },
      },
    ],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: outputColorBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: verticesBuffer,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: UBOBuffer,
        },
      },
    ],
  });

  const computeRasterizerModule = device.createShaderModule({
    code: computeRasterizerWGSL,
  });
  const rasterizerPipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    compute: { module: computeRasterizerModule, entryPoint: "main" },
  });
  const clearPipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    compute: { module: computeRasterizerModule, entryPoint: "clear" },
  });

  const aspect = WIDTH / HEIGHT;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);

  const addComputePass = (commandEncoder) => {
    // Compute model view projection matrix
    const viewMatrix = mat4.create();
    const now = Date.now() / 1000;
    // Move the camera
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(4, 3, -10));
    const modelViewProjectionMatrix = mat4.create();
    const modelMatrix = mat4.create();
    // Rotate model over time
    mat4.rotate(modelMatrix, modelMatrix, now, vec3.fromValues(0, 1, 0));
    // Rotate model 90 degrees so that it is upright
    mat4.rotate(
      modelMatrix,
      modelMatrix,
      Math.PI / 2,
      vec3.fromValues(1, 0, 0),
    );
    // Combine all into a modelViewProjection
    mat4.multiply(viewMatrix, viewMatrix, modelMatrix);
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);

    // Write values to uniform buffer object
    const uniformData = [WIDTH, HEIGHT];
    const uniformTypedArray = new Float32Array(uniformData);
    device.queue.writeBuffer(UBOBuffer, 0, uniformTypedArray.buffer);
    device.queue.writeBuffer(UBOBuffer, 16, modelViewProjectionMatrix.buffer);

    const passEncoder = commandEncoder.beginComputePass();
    let totalTimesToRun = Math.ceil((WIDTH * HEIGHT) / 256);
    // Clear pass
    passEncoder.setPipeline(clearPipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(totalTimesToRun);
    // Rasterizer pass
    totalTimesToRun = Math.ceil((vertexCount / 3) / 256);
    passEncoder.setPipeline(rasterizerPipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(totalTimesToRun);

    passEncoder.end();
  };

  return { addComputePass, outputColorBuffer };
}
