import { EventType, Surface, WindowBuilder } from "../mod.ts";

const window = new WindowBuilder("Hello, Deno!", 800, 600).build();
const canvas = window.canvas();

const surface = Surface.fromFile("tests/deno_logo.png");

const creator = canvas.textureCreator();
const texture = creator.createTextureFromSurface(surface);

// Fire up the event loop
for (const event of canvas.events()) {
  if (event.type == EventType.Quit) {
    canvas.quit();
  }

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
