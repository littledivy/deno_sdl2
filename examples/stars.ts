import { EventType, WindowBuilder } from "../mod.ts";
import { FPS } from "./utils.ts";

const HEIGHT = 800;
const WIDTH = 600;

const window = new WindowBuilder("Stars", WIDTH, HEIGHT).build();
const canvas = window.canvas();

const tick = FPS();

const star_count = 512;
const depth = 32;
const stars = [];
const cx = WIDTH / 2;
const cy = HEIGHT / 2;

const random = (u: number, l: number) => Math.random() * (u - l) + l;

for (let i = 0; i < star_count; i++) {
  const star = [random(-25, 25), random(-25, 25), random(1, depth)];
  stars.push(star);
}

for (const event of window.events()) {
  if (event.type == EventType.Quit) Deno.exit(0);
  else if (event.type == EventType.Draw) {
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
