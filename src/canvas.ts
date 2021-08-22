import { EventEmitter } from "https://deno.land/x/event@2.0.0/mod.ts";
import { exists } from "https://deno.land/x/std@0.105.0/fs/exists.ts";
import { decodeConn, encode, readStatus } from "./msg.ts";
import { PixelFormat } from "./pixel.ts";
import { FontRenderOptions } from "./font.ts";

export interface WindowOptions {
  title: String;
  height: number;
  width: number;
  flags?: number;
  position?: number[]; // (i32, i32)
  centered?: boolean;
  fullscreen?: boolean;
  hidden?: boolean;
  resizable?: boolean;
  minimized?: boolean;
  maximized?: boolean;
}

export enum AudioFormat {
  AUDIO_U8 = 0x0008,
  AUDIO_S8 = 0x8008,
  AUDIO_U16LSB = 0x0010,
  AUDIO_S16LSB = 0x8010,
  AUDIO_U16MSB = 0x1010,
  AUDIO_S16MSB = 0x9010,
  AUDIO_U16 = AUDIO_U16LSB,
  AUDIO_S16 = AUDIO_S16LSB,
  AUDIO_S32LSB = 0x8020,
  AUDIO_S32MSB = 0x9020,
  AUDIO_S32 = AUDIO_S32LSB,
  AUDIO_F32LSB = 0x8120,
  AUDIO_F32MSB = 0x9120,
  AUDIO_F32 = AUDIO_F32LSB,
  AUDIO_U16SYS = AUDIO_U16LSB,
  AUDIO_S16SYS = AUDIO_S16LSB,
  AUDIO_S32SYS = AUDIO_S32LSB,
  AUDIO_F32SYS = AUDIO_F32LSB,
}

export enum MouseButton {
  Unknown,
  Left,
  Middle,
  Right,
  X1,
  X2,
}

export interface Point {
  x: number;
  y: number;
}

type Event = {
  type:
    | "quit"
    | "app_terminating"
    | "app_low_memory"
    | "app_will_enter_background"
    | "app_did_enter_background"
    | "app_will_enter_foreground";
} | {
  type: "key_up" | "key_down";
  keycode?: number;
  scancode?: number;
  mod: number;
  repeat: boolean;
} | {
  type: "mouse_motion";
  which: number;
  x: number;
  y: number;
  xrel: number;
  yrel: number;
  state: number;
} | {
  type: "mouse_button_up" | "mouse_button_down";
  which: number;
  x: number;
  y: number;
  clicks: number;
  button: number;
} | {
  type: "mouse_wheel";
  x: number;
  y: number;
  which: number;
  direction: number;
} | { type: "unknown" };

type WindowEvent = {
  event: [Event];
  draw: [];
};

export interface Rect extends Point {
  width: number;
  height: number;
}

export class Canvas extends EventEmitter<WindowEvent> {
  #properties: WindowOptions;
  // Used internally. Too lazy to define types
  #tasks: any[] = [];
  #fonts: any[] = [];
  #audioCallback: (buf: Float32Array) => void = (_) => {};
  #resources: any[] = [];
  // TODO(@littledivy): Make this a read-only public?
  #closed = true;

  constructor(properties: WindowOptions) {
    super();
    this.#properties = properties;
    ["centered", "fullscreen", "hidden", "resizable", "minimized", "maximized"]
      .forEach((opt) => {
        (this.#properties as any)[opt] = (this.#properties as any)[opt] ||
          false;
      });
  }

  present() {
    this.#tasks.push("present");
  }

  clear() {
    this.#tasks.push("clear");
  }

  setDrawColor(r: number, g: number, b: number, a: number) {
    this.#tasks.push({ setDrawColor: { r, g, b, a } });
  }

  setScale(x: number, y: number) {
    this.#tasks.push({ setScale: { x, y } });
  }

  drawPoint(x: number, y: number) {
    this.#tasks.push({ drawPoint: { x, y } });
  }

  drawPoints(points: Point[]) {
    this.#tasks.push({ drawPoints: { points } });
  }

  drawLine(p1: Point, p2: Point) {
    this.#tasks.push({ drawLine: { p1, p2 } });
  }

  drawLines(points: Point[]) {
    this.#tasks.push({ drawLines: { points } });
  }

  drawRect(x: number, y: number, width: number, height: number) {
    this.#tasks.push({ drawRect: { x, y, width, height } });
  }

  drawRects(rects: Rect[]) {
    this.#tasks.push({ drawRects: { rects } });
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.#tasks.push({ fillRect: { x, y, width, height } });
  }

  fillRects(rects: Rect[]) {
    this.#tasks.push({ fillRects: { rects } });
  }

  quit() {
    this.#tasks.push("quit");
    this.#closed = true;
  }

  setDisplayMode(
    width: number,
    height: number,
    rate: number,
    format: PixelFormat,
  ) {
    this.#tasks.push({ setDisplayMode: { width, height, rate, format } });
  }

  setTitle(title: string) {
    this.#tasks.push({ setTitle: { title } });
  }

  setIcon(icon: string) {
    this.#tasks.push({ setIcon: { icon } });
  }

  setPosition(x: number, y: number) {
    this.#tasks.push({ setPosition: { x, y } });
  }

  setSize(width: number, height: number) {
    this.#tasks.push({ setSize: { width, height } });
  }

  setMinimumSize(width: number, height: number) {
    this.#tasks.push({ setMinimumSize: { width, height } });
  }

  setBrightness(brightness: number) {
    this.#tasks.push({ setBrightness: { brightness } });
  }

  setOpacity(opacity: number) {
    this.#tasks.push({ setOpacity: { opacity } });
  }

  show() {
    this.#tasks.push("show");
  }

  hide() {
    this.#tasks.push("hide");
  }

  raise() {
    this.#tasks.push("raise");
  }

  maximize() {
    this.#tasks.push("maximise");
  }

  minimize() {
    this.#tasks.push("minimize");
  }

  restore() {
    this.#tasks.push("restore");
  }

  loadFont(path: string, size: number, opts?: { style: string }): number {
    const options = { path, size, ...opts };
    const index = this.#fonts.push(options);
    // this.#tasks.push({ loadFont: { ...options, index } });
    return index;
  }

  renderFont(
    font: number,
    text: string,
    options: FontRenderOptions,
    target?: Rect,
  ) {
    const _font = this.#fonts[font - 1];
    if (!_font) {
      throw new Error("Font not loaded. Did you forget to call `loadFont` ?");
    }
    this.#tasks.push({ renderFont: { font, text, options, target, ..._font } });
  }

  setCursor(path: string) {
    const index = this.#resources.push(this.#resources.length);
    this.#tasks.push({ setCursor: { path, index } });
  }

  // createAudioDevice(callback: (buf: Float32Array) => void) {
  //   this.#tasks.push({ createAudioDevice: {} })
  //   this.#audioCallback = callback;
  // }

  openAudio(
    frequency: number,
    format: AudioFormat,
    channels: number,
    chunksize: number,
  ) {
    this.#tasks.push({ openAudio: { frequency, format, channels, chunksize } });
  }

  playMusic(path: string) {
    this.#tasks.push({ playMusic: { path } });
  }

  createSurface(width: number, height: number, format: PixelFormat) {
    const index = this.#resources.push({ width, height, format });
    this.#tasks.push({ createSurface: { width, height, format, index } });
    return index;
  }

  loadBitmap(path: string) {
    const index = this.#resources.push({ path });
    this.#tasks.push({ createSurfaceBitmap: { path, index } });
    return index;
  }

  createTextureFromSurface(surface: number) {
    // TODO: Verify surface
    const index = this.#resources.push({ surface });
    this.#tasks.push({ createTextureSurface: { surface, index } });
    return index;
  }

  copy(texture: number, rect1: Rect, rect2: Rect) {
    this.#tasks.push({ copyRect: { texture, rect1, rect2 } });
  }

  async start() {
    this.#closed = false;
    init(async (conn) => {
      const window = encode(this.#properties);
      await conn.write(window);

      const videoReqBuf = await readStatus(conn);

      switch (videoReqBuf) {
        case 1:
          // CANVAS_READY
          const canvas = encode({
            software: false,
          });
          await conn.write(canvas);
          // SDL event_pump
          event_loop: while (true) {
            const canvasReqBuf = await readStatus(conn);
            switch (canvasReqBuf) {
              case 1:
                // CANVAS_LOOP_ACTION
                const tasks = encode(this.#tasks);
                await conn.write(tasks);
		if(this.#closed) {
		  conn.close();
		  break event_loop;
		}
                this.#tasks = [];
                break;
              case 2:
                // EVENT_PUMP
                await decodeConn(conn).then((e: any) => {
                  e.forEach((ev: any) => {
                    const type = typeof ev == "string"
                      ? ev
                      : Object.keys(ev)[0];
                    this.emit("event", { type, ...ev[type] });
                  });
                });

                break;
              // TODO(@littledivy): Personally would love to have this <3
              // case 5:
              //   // AUDIO_CALLBACK
              //   const eventLengthBuffer = new Uint8Array(4);
              //   await conn.read(eventLengthBuffer);
              //   const view = new DataView(eventLengthBuffer.buffer, 0);
              //   const eventLength = view.getUint32(0, true);
              //   const buf = new Float32Array(eventLength);

              //   this.#audioCallback(buf);
              //   await conn.write(new Uint8Array([0, 0]))
              //   await conn.write(encode((Array.from(buf))));

              //   break;
              default:
                break;
            }

            this.emit("draw");
          }
          break;
        // TODO(littledivy): CANVAS_ERR
        default:
          break;
      }
    });
  }
}

async function downloadRelease() {
  let ext = Deno.build.os == "windows" ? ".exe" : "";
  if (await exists(`deno_sdl2${ext}`)) {
    return;
  }
  console.log("Downloading assets for", Deno.build.os);
  const resp = await fetch(
    "https://api.github.com/repos/littledivy/deno_sdl2/releases/latest",
  );
  const meta = await resp.json();
  if (!meta.assets) {
    throw new TypeError("No release found.");
  } else {
    const asset = meta.assets.find((m: any) =>
      Deno.build.os == "windows"
        ? m.name.endsWith(ext)
        : m.name.endsWith(
          `${Deno.build.os == "linux" ? "ubuntu" : "macos"}-latest`,
        )
    );
    if (!asset) {
      throw new TypeError(`Release asset for ${Deno.build.os} not found.`);
    }
    const bin = await fetch(asset.browser_download_url, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
    const file = await Deno.open(`deno_sdl2${ext}`, {
      write: true,
      mode: 0o755,
      create: true,
      truncate: true,
    });
    if (!bin.body) throw new TypeError("Response without body");
    for await (const chunk of bin.body) {
      await Deno.writeAll(file, chunk);
    }
    file.close();
  }
}

async function init(
  cb: (conn: Deno.Conn) => Promise<void>,
  // TODO(@littledivy): Make this toggleable with a build script?
  dev: boolean = false,
) {
  if (!dev) await downloadRelease();
  const listener = Deno.listen({ port: 34254, transport: "tcp" });
  const process = Deno.run({
    cmd: [dev ? "target/release/deno_sdl2" : "./deno_sdl2"],
    stderr: "inherit",
  });
  const conn = await listener.accept();
  const reqBuf = await readStatus(conn);
  switch (reqBuf) {
    case 0:
      // VIDEO_READY
      await cb(conn);
      break;
    default:
      break;
  }

  await process.status();
}
