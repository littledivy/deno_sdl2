import { Canvas } from "../../src/canvas.ts";
import { drawMap, Sprite } from "./util.ts";

const canvasSize = { width: 400, height: 400 };

const canv = new Canvas({
  title: "Deno run!",
  ...canvasSize,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: true,
  minimized: false,
  maximized: false,
  flags: null,
});

const surface = canv.loadSurface("./examples/sprite/sprite.png");
const texture = canv.createTextureFromSurface(surface);

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
  { x: 0, y: 0, width: 16, height: 16 },
  { x: 16, y: 0, width: 16, height: 16 },
  { x: 32, y: 0, width: 16, height: 16 },
  { x: 48, y: 0, width: 16, height: 16 },
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

for await (const event of canv) {
  switch (event.type) {
    case "draw":
      frame();
      break;
    case "quit":
      canv.quit();
      break;
    case "mouse_motion":
      // Mouse stuff
      break;
    case "key_down":
      // Keyboard stuff
      break;
    // ...
    default:
      break;
  }
}
