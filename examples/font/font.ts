import { Color, EventType, WindowBuilder } from "../../mod.ts";
import { FPS } from "../utils.ts";

const stepFrame = FPS();
const window = new WindowBuilder("deno_sdl2 Font", 800, 600).build();
const canvas = window.canvas();

const font = canvas.loadFont("./examples/font/jetbrains-mono.ttf", 128);
const color = new Color(0, 0, 0);

const surface = font.renderSolid(Deno.args[0] || "Hello there!", color);

const creator = canvas.textureCreator();
const texture = creator.createTextureFromSurface(surface);

async function frame() {
  canvas.clear();
  canvas.copy(texture);
  canvas.present();
  stepFrame();
}

for (const event of window.events()) {
  if (event.type == EventType.Quit) Deno.exit(0);
  else if (event.type == EventType.Draw) frame();
}
