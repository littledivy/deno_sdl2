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

export interface Rect extends Point {
  width: number;
  height: number;
}

export class Canvas {
  #properties: WindowOptions;
  // Used internally. Too lazy to define types
  #tasks: any[] = [];
  #fonts: any[] = [];
  #audioCallback: (buf: Float32Array) => void = (_) => {};
  #resources: any[] = [];
  // TODO(@littledivy): Make this a read-only public?
  #closed = true;

  constructor(properties: WindowOptions) {
    this.#properties = properties;
    ["centered", "fullscreen", "hidden", "resizable", "minimized", "maximized"]
      .forEach((opt) => {
        (this.#properties as any)[opt] = (this.#properties as any)[opt] ||
          false;
      });
  }
  /**
   * Updates the screen with any rendering performed since the previous call.
   * */
  present() {
    this.#tasks.push("present");
  }
  /**
   * Clears the current rendering target with the drawing color.
   * */
  clear() {
    this.#tasks.push("clear");
  }
  /**
   * Sets the color used for drawing operations (rect, line and clear).
   * */
  setDrawColor(r: number, g: number, b: number, a: number) {
    this.#tasks.push({ setDrawColor: { r, g, b, a } });
  }
  /**
   * Sets the drawing scale for rendering on the current target.
   * */
  setScale(x: number, y: number) {
    this.#tasks.push({ setScale: { x, y } });
  }
  /**
   * Draws a point on the current rendering target.
   * */
  drawPoint(x: number, y: number) {
    this.#tasks.push({ drawPoint: { x, y } });
  }
  /**
   * Draws multiple points on the current rendering target.
   * */
  drawPoints(points: Point[]) {
    this.#tasks.push({ drawPoints: { points } });
  }
  /**
   * Draws a line on the current rendering target. Errors if drawing fails for any reason.
   * */
  drawLine(p1: Point, p2: Point) {
    this.#tasks.push({ drawLine: { p1, p2 } });
  }
  /**
   * Draws a series of connected lines on the current rendering target. Errors if drawing fails for any reason.
   * */
  drawLines(points: Point[]) {
    this.#tasks.push({ drawLines: { points } });
  }
  /**
   * Draws a rectangle on the current rendering target. Errors if drawing fails for any reason.
   * */
  drawRect(x: number, y: number, width: number, height: number) {
    this.#tasks.push({ drawRect: { x, y, width, height } });
  }
  /**
   * Draws some number of rectangles on the current rendering target.
   * Errors if drawing fails for any reason.
   * */
  drawRects(rects: Rect[]) {
    this.#tasks.push({ drawRects: { rects } });
  }
  /**
   * Fills a rectangle on the current rendering target with the drawing color.
   * Passing None will fill the entire rendering target. Errors if drawing fails for any reason.
   * */
  fillRect(x: number, y: number, width: number, height: number) {
    this.#tasks.push({ fillRect: { x, y, width, height } });
  }
  /**
   * Fills some number of rectangles on the current rendering target with the drawing color.
   * Errors if drawing fails for any reason
   * */
  fillRects(rects: Rect[]) {
    this.#tasks.push({ fillRects: { rects } });
  }
  /**
   * Exit from canvas.
   * */
  quit() {
    this.#tasks.push("quit");
    this.#closed = true;
  }
  // TODO: (dhairy-online)
  setDisplayMode(
    width: number,
    height: number,
    rate: number,
    format: PixelFormat,
  ) {
    this.#tasks.push({ setDisplayMode: { width, height, rate, format } });
  }
  /**
   * Set title of the canvas.
   * */
  setTitle(title: string) {
    this.#tasks.push({ setTitle: { title } });
  }
  /**
   * Use this function to set the icon for a window.
   * */
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

  /**
   * Set the transparency of the window. The given value will be clamped internally between 0.0 (fully transparent),
   * and 1.0 (fully opaque).
   * This method returns an error if opacity isn't supported by the current platform.
   * */
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

  /**
   * Load a font for rendering.
   * @param path Relative path to the font
   * @param size Size of the font. (eg: 128)
   * @param opts Font options (eg: { italics: true })
   * @returns A loaded font reference
   */
  loadFont(path: string, size: number, opts?: { style: string }): number {
    const options = { path, size, ...opts };
    const index = this.#fonts.push(options);
    // this.#tasks.push({ loadFont: { ...options, index } });
    return index;
  }

  /**
   * Render a loaded font onto the current rendering target.
   * @param font a font loaded with `loadFont`
   * @param text Text to render.
   * @param options Font rendering options.
   * @param target Portion of the current rendering target.
   */
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

  /**
   * Set the cursor icon.
   * @param path Path to the source file
   */
  setCursor(path: string) {
    const index = this.#resources.push(this.#resources.length);
    this.#tasks.push({ setCursor: { path, index } });
  }

  // createAudioDevice(callback: (buf: Float32Array) => void) {
  //   this.#tasks.push({ createAudioDevice: {} })
  //   this.#audioCallback = callback;
  // }

  /**
   * Play a sound.
   * @param path Path of the source file
   */
  playMusic(path: string) {
    this.#tasks.push({ playMusic: { path } });
  }

  /**
   * Create a new surface.
   * @param width width of the surface.
   * @param height height of the surface.
   * @param format pixel format of the surface.
   * @returns a new surface
   */
  createSurface(width: number, height: number, format: PixelFormat) {
    const index = this.#resources.push({ width, height, format });
    this.#tasks.push({ createSurface: { width, height, format, index } });
    return index;
  }

  /**
   * Create a new surface from bitmap
   * @param path Path to the source file
   * @returns a new surface
   */
  loadBitmap(path: string) {
    const index = this.#resources.push({ path });
    this.#tasks.push({ createSurfaceBitmap: { path, index } });
    return index;
  }

  /**
   * Creates a new surface with SDL2_Image. Supports PNG and JPEG.
   * @param path Path to the source file
   * @returns a new surface
   */
  loadSurface(path: string) {
    const index = this.#resources.push({ path });
    this.#tasks.push({ loadSurface: { path, index } });
    return index;
  }

  /**
   * Creates a new texture from existing surface.
   * @param surface A surface created from load/create surface methods
   * @returns Texture
   */
  createTextureFromSurface(surface: number) {
    // TODO: Verify surface
    const index = this.#resources.push({ surface });
    this.#tasks.push({ createTextureSurface: { surface, index } });
    return index;
  }

  /**
   * Copied a portion of the texture into the current rendering target.
   * @param texture texture to be copied from
   * @param src portion of the texture to copy.
   * @param dest texture will be stretched on the given destination
   */
  copy(texture: number, src: Rect, dest: Rect) {
    this.#tasks.push({ copyRect: { texture, rect1: src, rect2: dest } });
  }

  /**
   * Start the event loop. Under the hood, it fires up the Rust client, polls for events and send tasks.
   * This function blocks rest of the JS event loop.
   *
   * Downloads the `deno_sdl2` client from Github releases on the first run.
   */
  async *[Symbol.asyncIterator]() {
    this.#closed = false;
    const conn = await init();

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
        event_loop:
        while (true) {
          const canvasReqBuf = await readStatus(conn);
          switch (canvasReqBuf) {
            case 1:
              // CANVAS_LOOP_ACTION
              const tasks = encode(this.#tasks);
              await conn.write(tasks);
              if (this.#closed) {
                conn.close();
                break event_loop;
              }
              this.#tasks = [];
              break;
            case 2:
              // EVENT_PUMP
              const rawEvents: any[] = await decodeConn(conn);
              for (const event of rawEvents) {
                const type = typeof event == "string"
                  ? event
                  : Object.keys(event)[0];
                yield { type, ...event[type] };
              }

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

          yield { type: "draw" };
        }
        break;
      // TODO(littledivy): CANVAS_ERR
      default:
        break;
    }
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
      Deno.build.os == "windows" ? m.name.endsWith(ext) : m.name.endsWith(
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

async function init(): Promise<Deno.Conn> {
  await downloadRelease();
  const listener = Deno.listen({ port: 34254, transport: "tcp" });
  const process = Deno.run({
    cmd: ["./deno_sdl2"],
    stderr: "inherit",
    stdout: "inherit",
  });
  const conn = await listener.accept();
  const reqBuf = await readStatus(conn);
  switch (reqBuf) {
    case 0:
      // VIDEO_READY
      return conn;
    default:
      throw new TypeError("Invalid request");
  }
}
