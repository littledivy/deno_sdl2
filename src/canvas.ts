import {
  CanvasFontPartial as FontRenderOptions,
  CanvasPoint as Point,
  CanvasTask,
  do_task,
  fill_events,
  init,
  poll_events,
  Rectangle as Rect,
  WindowOptions,
} from "../bindings/bindings.ts";
export type { Rectangle } from "../bindings/bindings.ts";

import { PixelFormat } from "./pixel.ts";

const exec = (t: CanvasTask) => do_task(t);

export class Canvas {
  #properties: WindowOptions;
  // Used internally. Too lazy to define types
  #fonts: any[] = [];
  #audioCallback: (buf: Float32Array) => void = (_) => {};
  #resources: any[] = [];
  // TODO(@littledivy): Make this a read-only public?
  #closed = true;

  constructor(properties: WindowOptions) {
    this.#properties = properties;
    init(properties, { software: false });

    ["centered", "fullscreen", "hidden", "resizable", "minimized", "maximized"]
      .forEach((opt) => {
        (this.#properties as any)[opt] = (this.#properties as any)[opt] ||
          false;
      });
  }
  /**
   * Updates the screen with any rendering performed since the previous call.
   */
  present() {
    exec("present");
  }
  /**
   * Clears the current rendering target with the drawing color.
   */
  clear() {
    exec("clear");
  }
  /**
   * Sets the color used for drawing operations (rect, line and clear).
   */
  setDrawColor(r: number, g: number, b: number, a: number) {
    exec({ setDrawColor: { r, g, b, a } });
  }
  /**
   * Sets the drawing scale for rendering on the current target.
   */
  setScale(x: number, y: number) {
    exec({ setScale: { x, y } });
  }
  /**
   * Draws a point on the current rendering target.
   */
  drawPoint(x: number, y: number) {
    exec({ drawPoint: { x, y } });
  }
  /**
   * Draws multiple points on the current rendering target.
   */
  drawPoints(points: Point[]) {
    exec({ drawPoints: { points } });
  }
  /**
   * Draws a line on the current rendering target. Errors if drawing fails for any reason.
   */
  drawLine(p1: Point, p2: Point) {
    exec({ drawLine: { p1, p2 } });
  }
  /**
   * Draws a series of connected lines on the current rendering target. Errors if drawing fails for any reason.
   */
  drawLines(points: Point[]) {
    exec({ drawLines: { points } });
  }
  /**
   * Draws a rectangle on the current rendering target. Errors if drawing fails for any reason.
   */
  drawRect(x: number, y: number, width: number, height: number) {
    exec({ drawRect: { x, y, width, height } });
  }
  /**
   * Draws some number of rectangles on the current rendering target.
   * Errors if drawing fails for any reason.
   */
  drawRects(rects: Rect[]) {
    exec({ drawRects: { rects } });
  }
  /**
   * Fills a rectangle on the current rendering target with the drawing color.
   * Passing None will fill the entire rendering target. Errors if drawing fails for any reason.
   */
  fillRect(x: number, y: number, width: number, height: number) {
    exec({ fillRect: { x, y, width, height } });
  }
  /**
   * Fills some number of rectangles on the current rendering target with the drawing color.
   * Errors if drawing fails for any reason
   */
  fillRects(rects: Rect[]) {
    exec({ fillRects: { rects } });
  }
  /**
   * Exit from canvas.
   */
  quit() {
    exec("quit");
    this.#closed = true;
  }
  /**
   * Set the display mode to use when a window is visible at fullscreen.
   * @param {number} width Width of the window
   * @param {number} height Height of the window
   * @param {number} rate Refresh rate 
   * @param {PixelFormat} format Pixel format Enum
   */
  setDisplayMode(
    width: number,
    height: number,
    rate: number,
    format: PixelFormat,
  ) {
    exec({ setDisplayMode: { width, height, rate, format } });
  }
  /**
   * Set title of the canvas.
   */
  setTitle(title: string) {
    exec({ setTitle: { title } });
  }
  /**
   * Use this function to set the icon for a window.
   */
  setIcon(icon: string) {
    exec({ setIcon: { icon } });
  }
  /**
   * Set the position of a window.
   * The window coordinate origin is the upper left of the display.
   * @param {number} x X Axis
   * @param {number} y Y Axis
   * */
  setPosition(x: number, y: number) {
    exec({ setPosition: { x, y } });
  }
  /**
   * Set the size of a window's client area.
   * @param {number} width
   * @param {number} height
   */
  setSize(width: number, height: number) {
    exec({ setSize: { width, height } });
  }
  /**
   * Set the minimum size of a window's client area.
   * @param {number} width
   * @param {number} height
   */
  setMinimumSize(width: number, height: number) {
    exec({ setMinimumSize: { width, height } });
  }
  /**
   * Set the brightness (gamma multiplier) for a given window's display.
   * @param {number} brightness 
   */
  setBrightness(brightness: number) {
    exec({ setBrightness: { brightness } });
  }

  /**
   * Set the transparency of the window. The given value will be clamped internally between 0.0 (fully transparent),
   * and 1.0 (fully opaque).
   * This method returns an error if opacity isn't supported by the current platform.
   */
  setOpacity(opacity: number) {
    exec({ setOpacity: { opacity } });
  }
  /**
   * Show a window.
   */
  show() {
    exec("show");
  }
  /**
   * Hide a window.
   */
  hide() {
    exec("hide");
  }
  /**
   * Raise a window above other windows and set the input focus.
   */
  raise() {
    exec("raise");
  }
  /**
   * Make a window as large as possible.
   */
  maximize() {
    exec("maximize");
  }
  /**
   * Minimize a window to an iconic representation.
   */
  minimize() {
    exec("minimize");
  }
  /**
   * Restore the size and position of a minimized or maximized window.
   */
  restore() {
    exec("restore");
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
    // exec({ loadFont: { ...options, index } });
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
    exec({ renderFont: { font, text, options, target, ..._font } });
  }

  /**
   * Set the cursor icon.
   * @param path Path to the source file
   */
  setCursor(path: string) {
    const index = this.#resources.push(this.#resources.length);
    exec({ setCursor: { path, index } });
  }

  // createAudioDevice(callback: (buf: Float32Array) => void) {
  //   exec({ createAudioDevice: {} })
  //   this.#audioCallback = callback;
  // }

  /**
   * Play a sound.
   * @param path Path of the source file
   */
  playMusic(path: string) {
    exec({ playMusic: { path } });
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
    exec({ createSurface: { width, height, format, index } });
    return index;
  }

  /**
   * Create a new surface from bitmap
   * @param path Path to the source file
   * @returns a new surface
   */
  loadBitmap(path: string) {
    const index = this.#resources.push({ path });
    exec({ createSurfaceBitmap: { path, index } });
    return index;
  }

  /**
   * Creates a new surface with SDL2_Image. Supports PNG and JPEG.
   * @param path Path to the source file
   * @returns a new surface
   */
  loadSurface(path: string) {
    const index = this.#resources.push({ path });
    exec({ loadSurface: { path, index } });
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
    exec({ createTextureSurface: { surface, index } });
    return index;
  }

  /**
   * Copied a portion of the texture into the current rendering target.
   * @param texture texture to be copied from
   * @param src portion of the texture to copy.
   * @param dest texture will be stretched on the given destination
   */
  copy(texture: number, src: Rect, dest: Rect) {
    exec({ copyRect: { texture, rect1: src, rect2: dest } });
  }

  /**
   * Start the event loop. Under the hood, it fires up the Rust client, polls for events and send tasks.
   * This function blocks rest of the JS event loop.
   */
  async *[Symbol.asyncIterator]() {
    this.#closed = false;
    while (true) {
      if (this.#closed) break;
      const len = poll_events();
      if (len > 0) {
        const u8 = new Uint8Array(len);
        fill_events(u8);
        // @ts-ignore
        const rawEvents = JSON.parse(Deno.core?.decode(u8));
        for (const event of rawEvents) {
          const type = typeof event == "string" ? event : Object.keys(event)[0];
          yield { type, ...event[type] };
        }
      }
      yield { type: "draw" };
    }
  }
}
