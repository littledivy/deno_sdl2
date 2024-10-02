import { EventType, WindowBuilder } from "../mod.ts";

await navigator.gpu.requestAdapter();

const window = new WindowBuilder("Raw window handle", 640, 480).build();
const _surface = window.windowSurface();

for await (const event of window.events()) {
  if (event.type === EventType.Quit) break;
}
