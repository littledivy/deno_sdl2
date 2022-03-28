import {
  EventType,
  PixelFormat,
  Rect,
  TextureAccess,
  WindowBuilder,
} from "../../lib/mod.ts";

const window = new WindowBuilder("Hello, Deno!", 1024, 1024).build();
const canvas = window.canvas();

const textureCreator = canvas.textureCreator();

const texture = textureCreator.createTexture(
  PixelFormat.IYUV,
  TextureAccess.Streaming,
  1024,
  1024,
);
const buf = Deno.readFileSync("examples/texture/logo.yuv");
texture.update(buf, 1024 * 4);
canvas.copy(texture);
canvas.present();

event_loop:
for (const event of window.events()) {
  switch (event.type) {
    case EventType.Quit:
    case EventType.KeyDown:
      break event_loop;
    default:
      break;
  }
}
