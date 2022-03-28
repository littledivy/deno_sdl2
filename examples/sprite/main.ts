import { EventType, Rect, Surface, WindowBuilder } from "../../lib/mod.ts";
import { drawMap, Sprite } from "./util.ts";

const canvasSize = { width: 400, height: 400 };
const window = new WindowBuilder(
  "Hello, Deno!",
  canvasSize.width,
  canvasSize.height,
).build();
const canv = window.canvas();

const surface = Surface.fromFile("./examples/sprite/sprite.png");

const creator = canv.textureCreator();
const texture = creator.createTextureFromSurface(surface);

const map = [
  [8, 8, 9, 8, 11, 8, 8, 8],
  [8, 8, 8, 8, 8, 8, 8, 8],
  [8, 10, 8, 8, 8, 8, 8, 8],
  [8, 8, 8, 8, 8, 8, 8, 8],
  [8, 8, 8, 8, 8, 8, 10, 8],
  [8, 8, 8, 8, 8, 9, 8, 8],
  [10, 8, 8, 8, 8, 8, 8, 8],
  [8, 8, 11, 8, 8, 8, 8, 8],
];

const denoTextureFrames = [
  new Rect(0, 0, 16, 16),
  new Rect(16, 0, 16, 16),
  new Rect(32, 0, 16, 16),
  new Rect(48, 0, 16, 16),
];

function random(min: number, max: number) {
  return (Math.random() * (max - min) + min) | 0;
}

function createDenoInstance() {
  const deno = new Sprite(texture, denoTextureFrames);
  deno.x = random(0, canvasSize.width);
  deno.y = random(0, canvasSize.height);
  deno.originX = deno.frames[0].width / 2;
  deno.originY = deno.frames[0].height;
  deno.scale = 4;
  deno.vx = 2;
  deno.vy = 1;
  return deno;
}

const denos: Sprite[] = [];

for (let i = 0; i < 1; i++) {
  denos.push(createDenoInstance());
}

let cnt = 0;

function frame() {
  canv.clear();
  drawMap(texture, canv, map, 16);

  for (const deno of denos) {
    deno.tick();
    deno.draw(canv);

    deno.wrap(canvasSize.width, canvasSize.height);

    // make deno jump
    deno.z = Math.abs(Math.sin(cnt / 10) * 16) | 0;

    if ((cnt / 20 | 0) % 2 === 0) {
      if (deno.vx > 0) {
        deno.index = 2;
      } else {
        deno.index = 0;
      }
    } else {
      if (deno.vx > 0) {
        deno.index = 3;
      } else {
        deno.index = 1;
      }
    }

    cnt++;
  }

  canv.present();
  Deno.sleepSync(10);
}

for (const event of window.events()) {
  switch (event.type) {
    case EventType.Draw:
      frame();
      break;
    case EventType.Quit:
      Deno.exit(0);
      break;
    default:
      break;
  }
}
