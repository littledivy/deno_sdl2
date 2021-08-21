import { Canvas } from "./src/canvas.ts";

function checkCollision(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
): boolean {
  return !(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2);
}

let x = 0, y = 0, directionX = 0, directionY = 0;

let win = false;
let speed = 0;
let prevTime = 0;

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

const surface = canvas.loadBitmap("player.bmp");
const texture = canvas.createTextureFromSurface(surface);

const font = canvas.loadFont(
  "/usr/share/fonts/JetBrainsMonoNL-Light.ttf",
  128,
  { style: "italic" },
);

canvas.on("draw", () => {
  let currTime = performance.now();
  speed = (currTime - prevTime) / 1000;
  prevTime = currTime;

  if (win) {
    const width = Math.round(770 / 20) * 3;
    const height = Math.round(169 / 10) * 3;
    canvas.renderFont(font, "Hit!", {
      blended: { color: { r: 0, g: 255, b: 255, a: 255 } },
    }, {
      // Change direction on screen overflow
      x: Math.floor(x) + 64,
      y: Math.floor(y) + 64,
      width,
      height,
    });
    canvas.present();
    return;
  }

  if (x >= 800 - 30) {
    directionX = 1;
  } else if (x <= 0) {
    directionX = 0;
  }

  if (y >= 600 - 30) {
    directionY = 1;
  } else if (y <= 0) {
    directionY = 0;
  }

  if (directionX == 0) {
    x += 800 * speed;
  } else {
    x -= 800 * speed;
  }

  if (directionY == 0) {
    y += 800 * speed;
  } else {
    y -= 800 * speed;
  }

  canvas.clear();

  canvas.copy(texture, { x: 0, y: 0, width: 64, height: 64 }, {
    x: Math.floor(x),
    y: Math.floor(y),
    width: 64,
    height: 64,
  });

  canvas.present();
});

let eventsRecv = 0;

canvas.on("event", (e) => {
  eventsRecv += 1;
  canvas.setTitle(
    `currTime: ${prevTime} events: ${eventsRecv} speed: ${speed}`,
  );

  if (e.type == "mouse_motion") {
    if (
      checkCollision(
        e.x,
        e.y,
        30,
        30,
        x,
        y,
        30,
        30,
      )
    ) {
      console.log("Hit");
      win = true;
    }
  }

  if (e.type == "quit") {
    canvas.quit();
  }
});

canvas.setCursor("/home/divy/Downloads/cursor48.png");

canvas.setDrawColor(0, 0, 0, 255);
canvas.clear();

canvas.present();

await canvas.start();
