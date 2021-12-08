import { Canvas } from "../mod.ts";
import { FPS } from "./utils.ts";

const HEIGHT = 800;
const WIDTH = 600;

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

// Max FPS
const tick = FPS(100);

const star_count = 512;
const depth = 32;
const stars = [];
const cx = WIDTH / 2;
const cy = HEIGHT / 2;

const random = (u: number, l: number) => Math.random() * (u - l) + l;

for (let i = 0; i < star_count; i++) {
  let star = [random(-25, 25), random(-25, 25), random(1, depth)];
  stars.push(star);
}

for await (const event of canvas) {
  if (event.type == "quit") canvas.quit();
  else if (event.type == "draw") {
    canvas.setDrawColor(0, 0, 0, 255);
    canvas.clear();

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      star[2] -= 0.2;
      if (star[2] <= 0) {
        star[0] = random(-25, 25);
        star[1] = random(-25, 25);
        star[2] = depth;
      }

      const k = 128 / star[2];
      const x = Math.floor(star[0] * k + cx);
      const y = Math.floor(star[1] * k + cy);

      if ((0 <= x && x < WIDTH) && (0 <= y && y < HEIGHT)) {
        const size = Math.floor((1 - star[2] / depth) * 3);
        const shade = Math.floor((1 - star[2] / depth) * 255);

        canvas.setDrawColor(shade, shade, shade, 255);
        canvas.fillRect(x, y, size, size);
      }
    }
    canvas.present();
    tick();
  }
}
