import { EventType, WindowBuilder } from "../mod.ts";

const window = new WindowBuilder("Hello, Deno!", 640, 480).build();
const [system, windowHandle, displayHandle] = window.windowHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

/* GPUCanvasContext */
const context = createWindowSurface(system, windowHandle, displayHandle);

context.configure({
  device: device,
  format: "bgra8unorm",
  height: 480,
  width: 640,
});

let r = 0.0;
let g = 0.0;
let b = 0.0;

console.log(device)

for (const event of window.events()) {
  if (event.type === EventType.Quit) {
    break;
  } else if (event.type === EventType.Draw) {
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r, g, b, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    context.present();
  }

  if (event.type === EventType.MouseMotion) {
    r = event.x / 640;
    g = event.y / 480;
    b = 1.0 - r - g;
  }
}
