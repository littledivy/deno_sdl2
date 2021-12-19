import { Canvas, PixelFormat, TextureAccess } from "../../mod.ts";

const canvas = new Canvas({
  title: "Hello, Deno!",
  height: 1024,
  width: 1024,
  centered: false,
  fullscreen: false,
  hidden: false,
  resizable: true,
  minimized: false,
  maximized: false,
  flags: null,
});

const texture = canvas.createTexture(
  PixelFormat.IYUV,
  TextureAccess.Streaming,
  1024,
  1024,
);
const buf = Deno.readFileSync("texture/examples/logo.yuv");
texture.update(buf);
const rect = { x: 0, y: 0, width: 1024, height: 1024 };
const screen = { x: 0, y: 0, width: 1024, height: 1024 };
canvas.copy(texture, rect, screen);
canvas.present();

event_loop:
for await (const event of canvas) {
  switch (event.type) {
    case "quit":
      break event_loop;
    case "key_down":
      break event_loop;
    default:
      break;
  }
}
