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

const decoder = new TextDecoder()
const module = Deno.readFileSync("examples/wgpu/shader.wgsl");
const shaderCode = decoder.decode(module)

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
            loadValue: [0, 1, 0, 1],
        },
    ],
});
renderPass.setPipeline(renderPipeline);
renderPass.draw(3, 1);
renderPass.endPass();

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

import { Canvas, PixelFormat, TextureAccess } from "../../mod.ts";

const canvas = new Canvas({
    title: "Hello, Deno!",
    height: 800,
    width: 800,
    centered: false,
    fullscreen: false,
    hidden: false,
    resizable: true,
    minimized: false,
    maximized: false,
    flags: null,
});

const sdl2texture = canvas.createTexture(
    PixelFormat.ABGR8888,
    TextureAccess.Streaming,
    800,
    200
)
await outputBuffer.mapAsync(1)
const buf = new Uint8Array(outputBuffer.getMappedRange())
const buffer = new Uint8Array(unpadded * dimensions.height);
for (let i = 0; i < dimensions.height; i++) {
  const slice = buf
    .slice(i * padded, (i + 1) * padded)
    .slice(0, unpadded);

    buffer.set(slice, i * unpadded);
}
sdl2texture.update(buffer)
const rect = { x: 0, y: 0, width: 200, height: 200 }
const screen = { x: 0, y: 0, width: 800, height: 800 }
canvas.copy(sdl2texture, rect, screen)
canvas.present()

event_loop:
for await (const event of canvas) {
    switch (event.type) {
        case "quit":
            break event_loop;
        case "key_down":
            break event_loop;
        default:
            break;
    }
}