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
canvas.clear();
canvas.present();
// Fire up the event loop
for await (const event of canvas) {
  if (event.type == "draw") {
    canvas.clear();
    canvas.present();
  }
}
