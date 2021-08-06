import { AudioFormat, Canvas, WindowEvent } from "./src/canvas.ts";

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

canvas.addEventListener("event", (e: WindowEvent) => {
  i++;
  canvas.setTitle(`recv(${i})`);

  if (e.detail == "Quit") {
    canvas.quit();
  }
});

canvas.openAudio(44_100, AudioFormat.AUDIO_S16LSB, 2, 1_024);

canvas.setCursor("/home/divy/Downloads/cursor48.png");

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

// canvas.playMusic("/home/divy/Downloads/sine440.mp3");
canvas.present();

await canvas.start();
