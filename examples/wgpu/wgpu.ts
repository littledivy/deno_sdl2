import {
  EventType,
  PixelFormat,
  Rect,
  TextureAccess,
  WindowBuilder,
} from "../../mod.ts";
const dimensions = {
  width: 200,
  height: 200,
};

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();

if (!device) {
  console.error("no suitable adapter found");
  Deno.exit(0);
}

const decoder = new TextDecoder();
const module = Deno.readFileSync("examples/wgpu/shader.wgsl");
const shaderCode = decoder.decode(module);

const shaderModule = device.createShaderModule({
  code: shaderCode,
});

const pipelineLayout = device.createPipelineLayout({
  bindGroupLayouts: [],
});

const renderPipeline = device.createRenderPipeline({
  layout: pipelineLayout,
  vertex: {
    module: shaderModule,
    entryPoint: "vs_main",
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fs_main",
    targets: [
      {
        format: "rgba8unorm-srgb",
      },
    ],
  },
});

// Get row padding
const bytesPerPixel = 4;
const unpadded = dimensions.width * bytesPerPixel;
const align = 256;
const paddedBytesPerRowPadding = (align - unpadded % align) %
  align;
const padded = unpadded + paddedBytesPerRowPadding;

const outputBuffer = device.createBuffer({
  label: "Capture",
  size: padded * dimensions.height,
  usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
});
const texture = device.createTexture({
  label: "Capture",
  size: dimensions,
  format: "rgba8unorm-srgb",
  usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
});

const encoder = device.createCommandEncoder();
const renderPass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: texture.createView(),
      storeOp: "store",
      loadOp: "clear",
      clearValue: [0, 1, 0, 1],
    },
  ],
});
renderPass.setPipeline(renderPipeline);
renderPass.draw(3, 1);
renderPass.end();

encoder.copyTextureToBuffer(
  { texture },
  {
    buffer: outputBuffer,
    bytesPerRow: padded,
    rowsPerImage: 0,
  },
  dimensions,
);

device.queue.submit([encoder.finish()]);

const window = new WindowBuilder("Hello, Deno!", 800, 800).build();
const canvas = window.canvas();

const creator = canvas.textureCreator();
const sdl2texture = creator.createTexture(
  PixelFormat.ABGR8888,
  TextureAccess.Streaming,
  200,
  200,
);

await outputBuffer.mapAsync(1);
const buf = new Uint8Array(outputBuffer.getMappedRange());
const buffer = new Uint8Array(unpadded * dimensions.height);
for (let i = 0; i < dimensions.height; i++) {
  const slice = buf
    .slice(i * padded, (i + 1) * padded)
    .slice(0, unpadded);

  buffer.set(slice, i * unpadded);
}

sdl2texture.update(buffer, 200 * 4);

const rect = new Rect(0, 0, 200, 200);
canvas.copy(sdl2texture, rect);
canvas.present();

for (const event of window.events()) {
  switch (event.type) {
    case EventType.Quit:
    case EventType.KeyDown:
      Deno.exit(0);
      break;
    default:
      break;
  }
}
