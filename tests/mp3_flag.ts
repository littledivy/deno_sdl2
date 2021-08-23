import { AudioFormat, Canvas } from "../src/canvas.ts";

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

canvas.openAudio(44_100, AudioFormat.AUDIO_S16LSB, 2, 1_024);
const music = await canvas.playMusic("tests/sample_0.mp3");

await canvas.start();
