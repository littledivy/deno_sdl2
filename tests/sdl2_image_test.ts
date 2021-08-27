import { Canvas } from "../src/canvas.ts";

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
});

const surface = canvas.loadSurface("tests/sample.gif");
const texture = canvas.createTextureFromSurface(surface);

canvas.copy(texture, { x: 0, y: 0, width: 480, height: 480 }, {
  x: 0,
  y: 0,
  width: 480,
  height: 480,
});
canvas.present()
// Fire up the event loop
for await (const _ of canvas) {
  continue;
}
