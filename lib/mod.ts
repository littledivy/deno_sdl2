import { init, sdl2 } from "./ffi.ts";
import {
  i32,
  SizedFFIType,
  Struct,
  u16,
  u32,
  u8,
} from "https://deno.land/x/byte_type@0.1.7/ffi.ts";

init();

const SDL_Event = new Struct({
  "type": u32,
});

export enum EventType {
  First = 0,
  Quit = 0x100,
  AppTerminating = 0x101,
  AppLowMemory = 0x102,
  AppWillEnterBackground = 0x103,
  AppDidEnterBackground = 0x104,
  AppWillEnterForeground = 0x105,
  AppDidEnterForeground = 0x106,
  WindowEvent = 0x200,
  KeyDown = 0x300,
  KeyUp = 0x301,
  MouseMotion = 0x400,
  MouseButtonDown = 0x401,
  MouseButtonUp = 0x402,
  MouseWheel = 0x403,
  //  JoyAxisMotion = 0x600,
  //  JoyBallMotion = 0x601,
  //  JoyHatMotion = 0x602,
  //  JoyButtonDown = 0x603,
  //  JoyButtonUp = 0x604,
  //  JoyDeviceAdded = 0x605,
  //  JoyDeviceRemoved = 0x606,
  //  ControllerAxisMotion = 0x650,
  //  ControllerButtonDown = 0x651,
  //  ControllerButtonUp = 0x652,
  //  ControllerDeviceAdded = 0x653,
  //  ControllerDeviceRemoved = 0x654,
  //  ControllerDeviceRemapped = 0x655,
  //  FingerDown = 0x700,
  //  FingerUp = 0x701,
  //  FingerMotion = 0x702,
  //  DollarGesture = 0x800,
  //  DollarRecord = 0x801,
  //  MultiGesture = 0x802,
  //  ClipboardUpdate = 0x900,
  //  DropFile = 0x1000,
  //  DropText = 0x1001,
  //  DropBegin = 0x1002,
  //  DropComplete = 0x1003,
  AudioDeviceAdded = 0x1100,
  AudioDeviceRemoved = 0x1101,
  //  RenderTargetsReset = 0x2000,
  //  RenderDeviceReset = 0x2001,
  User = 0x8000,
  Last = 0xFFFF,
  Draw,
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

export class Canvas {
  constructor(
    private window: Deno.UnsafePointer,
    private target: Deno.UnsafePointer,
  ) {}

  setDrawColor(r: number, g: number, b: number, a: number) {
    const ret = sdl2.symbols.SDL_SetRenderDrawColor(this.target, r, g, b, a);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  clear() {
    const ret = sdl2.symbols.SDL_RenderClear(this.target);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  present() {
    sdl2.symbols.SDL_RenderPresent(this.target);
  }

  drawPoint(x: number, y: number) {
    const ret = sdl2.symbols.SDL_RenderDrawPoint(this.target, x, y);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawPoints(points: [number, number][]) {
    const intArray = new Int32Array(points.flat());
    const ret = sdl2.symbols.SDL_RenderDrawPoints(
      this.target,
      Deno.UnsafePointer.of(intArray),
      intArray.length,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    const ret = sdl2.symbols.SDL_RenderDrawLine(this.target, x1, y1, x2, y2);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawLines(points: [number, number][]) {
    const intArray = new Int32Array(points.flat());
    const ret = sdl2.symbols.SDL_RenderDrawLines(
      this.target,
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
      this.target,
      Deno.UnsafePointer.of(intArray),
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  drawRects(rects: [number, number, number, number][]) {
    const intArray = new Int32Array(rects.flat());
    const ret = sdl2.symbols.SDL_RenderDrawRects(
      this.target,
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
      this.target,
      Deno.UnsafePointer.of(intArray),
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  fillRects(rects: [number, number, number, number][]) {
    const intArray = new Int32Array(rects.flat());
    const ret = sdl2.symbols.SDL_RenderFillRects(
      this.target,
      Deno.UnsafePointer.of(intArray),
      intArray.length,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  textureCreator() {
    return new TextureCreator(this.target);
  }
}

enum TextureAccess {
  Static = 0,
  Streaming = 1,
  Target = 2,
}

export class TextureCreator {
  constructor(private raw: Deno.UnsafePointer) {}

  createTexture(
    format: number,
    access: number,
    w: number,
    h: number,
  ): Texture {
    const raw = sdl2.symbols.SDL_CreateTexture(
      this.raw,
      format,
      access,
      w,
      h,
    );
    if (raw === null) {
      throwSDLError(0);
    }
    return new Texture(raw);
  }
}

export interface TextureQuery {
  format: number;
  access: TextureAccess;
  w: number;
  h: number;
}

export class Texture {
  constructor(private raw: Deno.UnsafePointer) {}

  query(): TextureQuery {
    const format = new Uint32Array(1);
    const access = new Uint32Array(1);
    const w = new Uint32Array(1);
    const h = new Uint32Array(1);

    const ret = sdl2.symbols.SDL_QueryTexture(
      this.raw,
      Deno.UnsafePointer.of(format),
      Deno.UnsafePointer.of(access),
      Deno.UnsafePointer.of(w),
      Deno.UnsafePointer.of(h),
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
    return {
      format: format[0],
      access: access[0],
      w: w[0],
      h: h[0],
    };
  }

  setColorMod(r: number, g: number, b: number) {
    const ret = sdl2.symbols.SDL_SetTextureColorMod(
      this.raw,
      r,
      g,
      b,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  setAlphaMod(a: number) {
    const ret = sdl2.symbols.SDL_SetTextureAlphaMod(this.raw, a);
    if (ret < 0) {
      throwSDLError(ret);
    }
  }

  update(pixels: Uint8Array, pitch: number, rect?: Rect) {
    const ret = sdl2.symbols.SDL_UpdateTexture(
      this.raw,
      rect ? rect[_raw] : null,
      Deno.UnsafePointer.of(pixels),
      pitch,
    );
    if (ret < 0) {
      throwSDLError(ret);
    }
  }
}

const _raw = Symbol("raw");
export class Rect {
  [_raw]: Uint32Array;
  constructor(x: number, y: number, w: number, h: number) {
    this[_raw] = new Uint32Array([x, y, w, h]);
  }
}

export class Surface {
  constructor(private raw: Deno.UnsafePointer) {}

  static loadBmp(path: string): Surface {
    const raw = sdl2.symbols.SDL_LoadBMP_RW(asCString(path));
    if (raw === null) {
      throwSDLError(0);
    }
    return new Surface(raw);
  }
}

const sizeOfEvent = 56; // type (u32) + event
const eventBuf = new Uint8Array(sizeOfEvent);
function makeReader<T extends Record<string, SizedFFIType<unknown>>>(
  eventType: Struct<T>,
) {
  return (reader: Deno.UnsafePointerView) => {
    return eventType.read(reader);
  };
}

const SDL_QuitEvent = new Struct({
  type: u32,
  timestamp: u32,
});

const SDL_CommonEvent = new Struct({
  type: u32,
  timestamp: u32,
});

const SDL_WindowEvent = new Struct({
  type: u32,
  timestamp: u32,
  windowID: u32,
  event: u8,
  padding1: u8,
  padding2: u8,
  padding3: u8,
  data1: i32,
  data2: i32,
});

const SDL_DisplayEvent = new Struct({
  type: u32,
  timestamp: u32,
  display: u32,
  event: u8,
  padding1: u8,
  padding2: u8,
  padding3: u8,
  data1: i32,
  data2: i32,
});

const SDL_KeySym = new Struct({
  scancode: u32,
  sym: u32,
  _mod: u16,
  unused: u32,
});

const SDL_KeyboardEvent = new Struct({
  type: u32,
  timestamp: u32,
  windowID: u32,
  state: u8,
  repeat: u8,
  padding2: u8,
  padding3: u8,
  keysym: SDL_KeySym,
});

const SDL_MouseMotionEvent = new Struct({
  type: u32,
  timestamp: u32,
  windowID: u32,
  which: u32,
  state: u32,
  x: i32,
  y: i32,
  xrel: i32,
  yrel: i32,
});

const SDL_MouseButtonEvent = new Struct({
  type: u32,
  timestamp: u32,
  windowID: u32,
  which: u32,
  button: u8,
  state: u8,
  padding1: u8,
  padding2: u8,
  x: i32,
  y: i32,
});

const SDL_MouseWheelEvent = new Struct({
  type: u32,
  timestamp: u32,
  windowID: u32,
  which: u32,
  x: i32,
  y: i32,
});

const SDL_AudioDeviceEvent = new Struct({
  type: u32,
  timestamp: u32,
  which: u32,
  event: u8,
  padding1: u8,
  padding2: u8,
  padding3: u8,
  data1: i32,
  data2: i32,
});

const SDL_FirstEvent = new Struct({
  type: u32,
});

const SDL_LastEvent = new Struct({
  type: u32,
});

type Reader<T> = (reader: Deno.UnsafePointerView) => T;
const eventReader: Record<EventType, Reader<any>> = {
  [EventType.First]: makeReader(SDL_FirstEvent),
  [EventType.Quit]: makeReader(SDL_QuitEvent),
  [EventType.WindowEvent]: makeReader(SDL_WindowEvent),
  [EventType.AppTerminating]: makeReader(SDL_CommonEvent),
  [EventType.AppLowMemory]: makeReader(SDL_CommonEvent),
  [EventType.AppWillEnterBackground]: makeReader(SDL_CommonEvent),
  [EventType.AppDidEnterBackground]: makeReader(SDL_CommonEvent),
  [EventType.AppWillEnterForeground]: makeReader(SDL_CommonEvent),
  [EventType.AppDidEnterForeground]: makeReader(SDL_CommonEvent),
  // [EventType.Display]: makeReader(SDL_DisplayEvent),
  [EventType.KeyDown]: makeReader(SDL_KeyboardEvent),
  [EventType.KeyUp]: makeReader(SDL_KeyboardEvent),
  [EventType.MouseMotion]: makeReader(SDL_MouseMotionEvent),
  [EventType.MouseButtonDown]: makeReader(SDL_MouseButtonEvent),
  [EventType.MouseButtonUp]: makeReader(SDL_MouseButtonEvent),
  [EventType.MouseWheel]: makeReader(SDL_MouseWheelEvent),
  [EventType.AudioDeviceAdded]: makeReader(SDL_AudioDeviceEvent),
  [EventType.AudioDeviceRemoved]: makeReader(SDL_AudioDeviceEvent),
  [EventType.User]: makeReader(SDL_CommonEvent),
  [EventType.Last]: makeReader(SDL_LastEvent),
  // TODO: Unrechable code
  [EventType.Draw]: makeReader(SDL_CommonEvent),
};

export class Window {
  constructor(private raw: Deno.UnsafePointer) {}

  canvas() {
    // Hardware accelerated canvas
    const raw = sdl2.symbols.SDL_CreateRenderer(this.raw, -1, 0);
    return new Canvas(this.raw, raw);
  }

  *events() {
    while (true) {
      const event = Deno.UnsafePointer.of(eventBuf);
      const pending = sdl2.symbols.SDL_PollEvent(event) == 1;
      if (!pending) {
        yield { type: EventType.Draw };
      }
      const view = new Deno.UnsafePointerView(event);
      const type = view.getUint32();
      const ev = eventReader[type as EventType];
      if (!ev) {
        // throw new Error(`Unknown event type: ${type}`);
        continue;
      }
      yield { ...ev(view) };
    }
  }
}

export class WindowBuilder {
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

export class VideoSubsystem {
  currentVideoDriver(): string {
    const buf = sdl2.symbols.SDL_GetCurrentVideoDriver();
    if (buf === null) {
      throw new Error("SDL_GetCurrentVideoDriver failed");
    }
    const view = new Deno.UnsafePointerView(buf);
    return view.getCString();
  }
}

