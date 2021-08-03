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

let i = 0;
let prevX = 0, prevY = 0;

canvas.addEventListener("event", (e: WindowEvent) => {
  i++;
  canvas.setTitle(`i = ${i}`);

  if (e.detail == "Quit") {
    canvas.quit();
  }

  if (e.detail["MouseMotion"]) {
    canvas.fillRect(prevX, prevY, 5, 5);

    canvas.setDrawColor(255, 255, 255, 1);

    canvas.fillRect(
      e.detail["MouseMotion"].x,
      e.detail["MouseMotion"].y,
      5,
      5,
    );

    prevX = e.detail["MouseMotion"].x;
    prevY = e.detail["MouseMotion"].y;
    canvas.present();
    // Reset color
    canvas.setDrawColor(0, 64, 255, 1);
  }
});

canvas.setDrawColor(0, 64, 255, 1);
canvas.clear();

const font = canvas.loadFont(
  Deno.args[0] || "/usr/share/fonts/JetBrainsMonoNL-Light.ttf",
  128,
  { style: "normal" },
);
canvas.renderFont(font, "Hello Deno", {
  blended: { color: { r: 0, g: 0, b: 0, a: 255 } },
}, { x: 10, y: 10, width: 770 / 2, height: Math.round(169 / 2) });

canvas.present();

await canvas.start();
