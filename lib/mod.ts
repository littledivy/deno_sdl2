import { init, sdl2 } from "./ffi.ts";
import { Struct, u8 } from "https://deno.land/x/byte_type@0.1.7/ffi.ts";

init();

const SDL_Event = new Struct({
  "type": u8,
});

enum EventType {
  First = 0,
  Quit = 0x100,
  WindowEvent = 0x200,
  KeyDown = 0x300,
  KeyUp = 0x301,
  MouseMotion = 0x400,
  MouseButtonDown = 0x401,
  MouseButtonUp = 0x402,
  MouseWheel = 0x403,
  JoyAxisMotion = 0x600,
  JoyBallMotion = 0x601,
  JoyHatMotion = 0x602,
  JoyButtonDown = 0x603,
  JoyButtonUp = 0x604,
  JoyDeviceAdded = 0x605,
  JoyDeviceRemoved = 0x606,
  ControllerAxisMotion = 0x650,
  ControllerButtonDown = 0x651,
  ControllerButtonUp = 0x652,
  ControllerDeviceAdded = 0x653,
  ControllerDeviceRemoved = 0x654,
  ControllerDeviceRemapped = 0x655,
  FingerDown = 0x700,
  FingerUp = 0x701,
  FingerMotion = 0x702,
  DollarGesture = 0x800,
  DollarRecord = 0x801,
  MultiGesture = 0x802,
  ClipboardUpdate = 0x900,
  DropFile = 0x1000,
  DropText = 0x1001,
  DropBegin = 0x1002,
  DropComplete = 0x1003,
  AudioDeviceAdded = 0x1100,
  AudioDeviceRemoved = 0x1101,
  RenderTargetsReset = 0x2000,
  RenderDeviceReset = 0x2001,
  User = 0x8000,
  Last = 0xFFFF,
}

function asCString(str: string): Uint8Array {
  // @ts-ignore
  return Deno.core.encode(`${str}\0`);
}

function throwSDLError(err: number): never {
  const error = sdl2.symbols.SDL_GetError();
  const view = new Deno.UnsafePointerView(error);
  throw new Error(`SDL Error: ${view.getCString()}`);
}

class Canvas {
  constructor(
    private raw: Deno.UnsafePointer,
    private target: Deno.UnsafePointer,
  ) {}

  setDrawColor(r: number, g: number, b: number, a: number) {
    const ret = sdl2.symbols.SDL_SetRenderDrawColor(this.target, r, g, b, a);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  clear() {
    const ret = sdl2.symbols.SDL_RenderClear(this.raw);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  present() {
    sdl2.symbols.SDL_RenderPresent(this.raw);
  }

  drawPoint(x: number, y: number) {
    const ret = sdl2.symbols.SDL_RenderDrawPoint(this.raw, x, y);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawPoints(points: [number, number][]) {
    const intArray = new Int32Array(points.flat());
    const ret = sdl2.symbols.SDL_RenderDrawPoints(
      this.raw,
      Deno.UnsafePointer.of(intArray),
      intArray.length,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    const ret = sdl2.symbols.SDL_RenderDrawLine(this.raw, x1, y1, x2, y2);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawLines(points: [number, number][]) {
    const intArray = new Int32Array(points.flat());
    const ret = sdl2.symbols.SDL_RenderDrawLines(
      this.raw,
      Deno.UnsafePointer.of(intArray),
      intArray.length,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawRect(x: number, y: number, w: number, h: number) {
    const intArray = new Int32Array([x, y, w, h]);
    const ret = sdl2.symbols.SDL_RenderDrawRect(
      this.raw,
      Deno.UnsafePointer.of(intArray),
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawRects(rects: [number, number, number, number][]) {
    const intArray = new Int32Array(rects.flat());
    const ret = sdl2.symbols.SDL_RenderDrawRects(
      this.raw,
      Deno.UnsafePointer.of(intArray),
      intArray.length,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  fillRect(x: number, y: number, w: number, h: number) {
    const intArray = new Int32Array([x, y, w, h]);
    const ret = sdl2.symbols.SDL_RenderFillRect(
      this.raw,
      Deno.UnsafePointer.of(intArray),
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  fillRects(rects: [number, number, number, number][]) {
    const intArray = new Int32Array(rects.flat());
    const ret = sdl2.symbols.SDL_RenderFillRects(
      this.raw,
      Deno.UnsafePointer.of(intArray),
      intArray.length,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }
}

class Window {
  constructor(private raw: Deno.UnsafePointer) {}

  canvas() {
    // Hardware accelerated canvas
    const raw = sdl2.symbols.SDL_CreateRenderer(this.raw, -1, 0);
    return new Canvas(raw, this.raw);
  }
}

class WindowBuilder {
  private flags: number = 0;
  constructor(
    private title: string,
    private width: number,
    private height: number,
  ) {}

  build() {
    const title = asCString(this.title);
    const window = sdl2.symbols.SDL_CreateWindow(
      title,
      0,
      0,
      this.width,
      this.height,
      this.flags,
    );
    return new Window(window);
  }

  fullscreen() {
    this.flags |= 0x00000001;
    return this;
  }

  resizable() {
    this.flags |= 0x00000002;
    return this;
  }

  borderless() {
    this.flags |= 0x00000004;
    return this;
  }

  alwaysOnTop() {
    this.flags |= 0x00000008;
    return this;
  }

  openGL() {
    this.flags |= 0x00000010;
    return this;
  }

  highDPI() {
    this.flags |= 0x00000020;
    return this;
  }

  inputGrabbed() {
    this.flags |= 0x00000040;
    return this;
  }

  inputFocus() {
    this.flags |= 0x00000080;
    return this;
  }

  mouseFocus() {
    this.flags |= 0x00000100;
    return this;
  }

  foreign() {
    this.flags |= 0x00000200;
    return this;
  }

  allowHighDPI() {
    this.flags |= 0x00000400;
    return this;
  }
}

class VideoSubsystem {
  currentVideoDriver(): string {
    const buf = sdl2.symbols.SDL_GetCurrentVideoDriver();
    if (buf === null) {
      throw new Error("SDL_GetCurrentVideoDriver failed");
    }
    const view = new Deno.UnsafePointerView(buf);
    return view.getCString();
  }
}

new WindowBuilder("Hello", 640, 480).build();
