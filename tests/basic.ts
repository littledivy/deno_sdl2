import { EventType, WindowBuilder } from "../mod.ts";
import { FPS } from "../examples/utils.ts";

const window = new WindowBuilder("Hello, Deno!", 640, 480).build();
const canvas = window.canvas();
canvas.clear();
canvas.present();
const fps = FPS();
for (const event of window.events()) {
  fps();
  if (event.type == EventType.Quit) {
    break;
  } else if (event.type == EventType.Draw) {
    canvas.clear();
    canvas.present();
  }
}
