import { EventType, WindowBuilder } from "../lib/mod.ts";
import { FPS } from "../examples/utils.ts";

const window = new WindowBuilder("Hello, Deno!", 640, 480).build();
const canvas = window.canvas();

const fps = FPS();
for (const event of window.events()) {
  fps();
  if (event.type == EventType.Quit) {
    break;
  } else if (event.type == EventType.Draw) {
    // Rainbow effect
    const r = Math.sin(Date.now() / 1000) * 127 + 128;
    const g = Math.sin(Date.now() / 1000 + 2) * 127 + 128;
    const b = Math.sin(Date.now() / 1000 + 4) * 127 + 128;
    canvas.setDrawColor(Math.floor(r), Math.floor(g), Math.floor(b), 255);
    canvas.clear();
    canvas.present();
  }
}
