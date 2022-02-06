import { Canvas } from "../mod.ts";

const canvas = new Canvas({
  title: "Hello, Deno!",
  height: 800,
  width: 600,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: true,
  minimized: false,
  maximized: false,
  flags: null,
});

const surface = canvas.loadSurface("tests/deno_logo.png");
const texture = canvas.createTextureFromSurface(surface);

// Fire up the event loop
for await (const event of canvas) {
  if (event.type == "quit") {
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
