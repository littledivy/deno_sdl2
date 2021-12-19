import { Canvas } from "../../mod.ts";
import { FPS } from "../utils.ts";

const stepFrame = FPS(100);
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

const font = canvas.loadFont("./examples/font/jetbrains-mono.ttf", 128, {
  style: "normal",
});

const surface = canvas.renderFont(font, Deno.args[0] || "Hello there!", {
  blended: {
    color: {
      r: 255,
      g: 255,
      b: 255,
      a: 255,
    },
  },
});
const texture = canvas.createTextureFromSurface(surface);
const { width, height } = texture;

async function frame() {
  canvas.clear();
  canvas.copy(texture, { x: 0, y: 0, width, height }, {
    x: 0,
    y: 0,
    width,
    height,
  });
  canvas.present();
  stepFrame();
}

for await (const event of canvas) {
  if (event.type == "quit") canvas.quit();
  else if (event.type == "draw") await frame();
}
