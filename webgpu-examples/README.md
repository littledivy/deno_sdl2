## sdl2 + webgpu examples

- `babylon.ts`: Babylon.js game engine sample scene.
- `gameoflife.ts`: Conway's Game of life showcasing compute + render pass.
- `rasterizer.ts`: Gltf rasterizer.

```typescript
import { EventType, WindowBuilder } from "deno_sdl2";

const win = new WindowBuilder("sdl2 + webgpu + deno", 512, 512).build();

const [sys, whnd, dhnd] = win.rawHandle();
const context = Deno.createWindowSurface(sys, whnd, dhnd);
context.configure({/* ... */});

for (const event of win.events()) {
  if (event.type == EventType.Quit) break;

  const textureView = context.getCurrentTexture().createView();
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r, g, b, a },
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
```
