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
    canvas.setDrawColor(255, 255, 255, 255);
    canvas.clear();
    canvas.copy(texture, { x: 0, y: 0, width: 290, height: 250 }, {
      x: 0,
      y: 0,
      width: 290,
      height: 250,
    });

    canvas.present();

    continue;
  }
}

const surface = canvas.loadSurface("tests/deno_logo.png");
const texture = canvas.createTextureFromSurface(surface);
