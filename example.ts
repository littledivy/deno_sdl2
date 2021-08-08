import { Canvas, WindowEvent } from "./src/canvas.ts";

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

const surface = canvas.loadBitmap("test.bmp");
const texture = canvas.createTextureFromSurface(surface);

canvas.addEventListener("draw", () => {
  let currTime = performance.now();
  speed = (currTime - prevTime) / 1000;
  prevTime = currTime;

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
    x += 1000 * speed;
  } else {
    x -= 1000 * speed;
  }

  if (directionY == 0) {
    y += 1000 * speed;
  } else {
    y -= 1000 * speed;
  }

  canvas.clear();
  canvas.copy(texture, { x: 0, y: 0, width: 30, height: 30 }, {
    x: Math.floor(x),
    y: Math.floor(y),
    width: 30,
    height: 30,
  });

  canvas.present();
});

let eventsRecv = 0;

canvas.addEventListener("event", (e: WindowEvent) => {
  eventsRecv += 1;
  canvas.setTitle(
    `currTime: ${prevTime} events: ${eventsRecv} speed: ${speed}`,
  );

  const mouseBtnDown = e.detail.find((i: any) => i["MouseButtonDown"]);
  if (mouseBtnDown) {
    if (
      checkCollision(
        mouseBtnDown.MouseButtonDown.x,
        mouseBtnDown.MouseButtonDown.y,
        10,
        10,
        x,
        y,
        30,
        30,
      )
    ) {
      console.log("Hit");
    }
  }

  if (e.detail.includes("Quit")) {
    canvas.quit();
  }
});

canvas.setCursor("/home/divy/Downloads/cursor48.png");

canvas.setDrawColor(0, 0, 0, 255);
canvas.clear();

canvas.present();

await canvas.start();
