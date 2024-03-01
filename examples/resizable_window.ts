import { EventType, WindowBuilder } from "../mod.ts";
import { FPS } from "../examples/utils.ts";

const window = new WindowBuilder("Hello, Deno!", 640, 480).resizable().build();
const canvas = window.canvas();

const fps = FPS();
for await (const event of window.events()) {
  fps();
  if (event.type == EventType.Quit) {
    break;
  } else if (event.type == EventType.Draw) {
    canvas.setDrawColor(0, 0, 0, 255);
    canvas.clear();
    canvas.present();
  }
}
