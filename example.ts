import { Canvas, WindowEvent } from "./src/canvas.ts";

const canvas = new Canvas({
  title: "Hello, Deno!",
  height: 800,
  width: 600,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: false,
  minimized: false,
  maximized: false,
});

let x = 0, y = 0, directionX = 0, directionY = 0;

const surface = canvas.loadBitmap("test.bmp");
const texture = canvas.createTextureFromSurface(surface);

let eventsRecv = 0;
canvas.addEventListener("event", (e: WindowEvent) => {
  eventsRecv += 1;
  canvas.setTitle(`recv(${eventsRecv})`);
  if (e.detail.includes("Quit")) {
    canvas.quit();
  }
});

const font = canvas.loadFont(
  Deno.args[0] || "/usr/share/fonts/JetBrainsMonoNL-Light.ttf",
  128,
  { style: "normal" },
);

canvas.addEventListener("draw", () => {
  // Deno.sleepSync(0)

  if (x >= 800) {
    directionX = 1;
  } else if (x == 0) {
    directionX = 0;
  }

  if (y >= 600) {
    directionY = 1;
  } else if (y == 0) {
    directionY = 0;
  }

  if (directionX == 0) {
    x += 1;
  } else {
    x -= 1;
  }

  if (directionY == 0) {
    y += 1;
  } else {
    y -= 1;
  }

  canvas.copy(texture, { x: 0, y: 0, width: 30, height: 30 }, {
    x,
    y,
    width: 30,
    height: 30,
  });

  canvas.renderFont(font, "Hello Deno", {
    blended: { color: { r: 255, g: 255, b: 255, a: 255 } },
  }, { x: 10, y: 10, width: 770 / 2, height: Math.round(169 / 2) });

  canvas.present();
});

canvas.setCursor("/home/divy/Downloads/cursor48.png");

canvas.setDrawColor(0, 0, 0, 255);
canvas.clear();

canvas.present();

await canvas.start();
