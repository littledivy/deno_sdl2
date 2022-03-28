import {
  i32,
  SizedFFIType,
  Struct,
  u16,
  u32,
  u8,
} from "https://deno.land/x/byte_type@0.1.7/ffi.ts";

let DENO_SDL2_PATH: string | undefined;
try {
  DENO_SDL2_PATH = Deno.env.get("DENO_SDL2_PATH");
} catch (_) {
  // ignore, this can only fail if permission is not given
}

const OS_PREFIX = Deno.build.os === "windows" ? "" : "lib";
const OS_SUFFIX = Deno.build.os === "windows"
  ? ".dll"
  : Deno.build.os === "darwin"
  ? ".dylib"
  : ".so";

function getLibraryPath(lib: string): string {
  lib = `${OS_PREFIX}${lib}${OS_SUFFIX}`;
  if (DENO_SDL2_PATH) {
    return `${DENO_SDL2_PATH}/${lib}`;
  } else {
    return lib;
  }
}

const sdl2 = Deno.dlopen(getLibraryPath("SDL2"), {
  "SDL_Init": {
    "parameters": ["u32"],
    "result": "i32",
  },
  "SDL_InitSubSystem": {
    "parameters": ["u32"],
    "result": "i32",
  },
  "SDL_QuitSubSystem": {
    "parameters": ["u32"],
    "result": "i32",
  },
  "SDL_GetPlatform": {
    "parameters": [],
    "result": "pointer",
  },
  "SDL_GetError": {
    "parameters": [],
    "result": "pointer",
  },
  "SDL_PollEvent": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_GetCurrentVideoDriver": {
    "parameters": [],
    "result": "pointer",
  },
  "SDL_CreateWindow": {
    "parameters": [
      "pointer",
      "i32",
      "i32",
      "i32",
      "i32",
      "u32",
    ],
    "result": "pointer",
  },
  "SDL_DestroyWindow": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_GetWindowSize": {
    "parameters": ["pointer", "pointer", "pointer"],
    "result": "i32",
  },
  "SDL_GetWindowPosition": {
    "parameters": ["pointer", "pointer", "pointer"],
    "result": "i32",
  },
  "SDL_GetWindowFlags": {
    "parameters": ["pointer"],
    "result": "u32",
  },
  "SDL_SetWindowTitle": {
    "parameters": ["pointer", "pointer"],
    "result": "i32",
  },
  "SDL_SetWindowIcon": {
    "parameters": ["pointer", "pointer"],
    "result": "i32",
  },
  "SDL_SetWindowPosition": {
    "parameters": ["pointer", "i32", "i32"],
    "result": "i32",
  },
  "SDL_SetWindowSize": {
    "parameters": ["pointer", "i32", "i32"],
    "result": "i32",
  },
  "SDL_SetWindowFullscreen": {
    "parameters": ["pointer", "u32"],
    "result": "i32",
  },
  "SDL_SetWindowMinimumSize": {
    "parameters": ["pointer", "i32", "i32"],
    "result": "i32",
  },
  "SDL_SetWindowMaximumSize": {
    "parameters": ["pointer", "i32", "i32"],
    "result": "i32",
  },
  "SDL_SetWindowBordered": {
    "parameters": ["pointer", "i32"],
    "result": "i32",
  },
  "SDL_SetWindowResizable": {
    "parameters": ["pointer", "i32"],
    "result": "i32",
  },
  "SDL_SetWindowInputFocus": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_SetWindowGrab": {
    "parameters": ["pointer", "i32"],
    "result": "i32",
  },
  "SDL_CreateRenderer": {
    "parameters": ["pointer", "i32", "u32"],
    "result": "pointer",
  },
  "SDL_SetRenderDrawColor": {
    "parameters": ["pointer", "u8", "u8", "u8", "u8"],
    "result": "i32",
  },
  "SDL_RenderClear": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_SetRenderDrawBlendMode": {
    "parameters": ["pointer", "u32"],
    "result": "i32",
  },
  "SDL_RenderPresent": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_RenderDrawPoint": {
    "parameters": ["pointer", "i32", "i32"],
    "result": "i32",
  },
  "SDL_RenderDrawPoints": {
    "parameters": ["pointer", "pointer", "i32"],
    "result": "i32",
  },
  "SDL_RenderDrawLine": {
    "parameters": ["pointer", "i32", "i32", "i32", "i32"],
    "result": "i32",
  },
  "SDL_RenderDrawLines": {
    "parameters": ["pointer", "pointer", "i32"],
    "result": "i32",
  },
  "SDL_RenderDrawRect": {
    "parameters": ["pointer", "pointer"],
    "result": "i32",
  },
  "SDL_RenderDrawRects": {
    "parameters": ["pointer", "pointer", "i32"],
    "result": "i32",
  },
  "SDL_RenderFillRect": {
    "parameters": ["pointer", "pointer"],
    "result": "i32",
  },
  "SDL_RenderFillRects": {
    "parameters": ["pointer", "pointer", "i32"],
    "result": "i32",
  },
  "SDL_RenderCopy": {
    "parameters": ["pointer", "pointer", "pointer", "pointer"],
    "result": "i32",
  },
  "SDL_RenderCopyEx": {
    "parameters": [
      "pointer",
      "pointer",
      "pointer",
      "pointer",
      "f32",
      "pointer",
      "u32",
    ],
    "result": "i32",
  },
  "SDL_RenderReadPixels": {
    "parameters": ["pointer", "pointer", "u32", "pointer", "i32"],
    "result": "i32",
  },
  "SDL_CreateTexture": {
    "parameters": ["pointer", "u32", "i32", "i32", "i32"],
    "result": "pointer",
  },
  "SDL_DestroyTexture": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_QueryTexture": {
    "parameters": [
      "pointer",
      "pointer",
      "pointer",
      "pointer",
      "pointer",
    ],
    "result": "i32",
  },
  "SDL_SetTextureColorMod": {
    "parameters": ["pointer", "u8", "u8", "u8"],
    "result": "i32",
  },
  "SDL_SetTextureAlphaMod": {
    "parameters": ["pointer", "u8"],
    "result": "i32",
  },
  "SDL_UpdateTexture": {
    "parameters": ["pointer", "pointer", "pointer", "i32"],
    "result": "i32",
  },
  "SDL_LoadBMP_RW": {
    "parameters": ["pointer"],
    "result": "pointer",
  },
  "SDL_CreateTextureFromSurface": {
    "parameters": ["pointer", "pointer"],
    "result": "pointer",
  },
});

const sdl2Image = Deno.dlopen(getLibraryPath("SDL2_image"), {
  "IMG_Init": {
    "parameters": ["u32"],
    "result": "u32",
  },
  "IMG_Load": {
    "parameters": ["pointer"],
    "result": "pointer",
  },
});

const sdl2Font = Deno.dlopen(getLibraryPath("SDL2_ttf"), {
  "TTF_Init": {
    "parameters": [],
    "result": "u32",
  },
  "TTF_OpenFont": {
    "parameters": ["pointer", "i32"],
    "result": "pointer",
  },
  "TTF_RenderText_Solid": {
    "parameters": ["pointer", "pointer", "pointer"],
    "result": "pointer",
  },
  "TTF_RenderText_Shaded": {
    "parameters": ["pointer", "pointer", "pointer", "pointer"],
    "result": "pointer",
  },
  "TTF_RenderText_Blended": {
    "parameters": ["pointer", "pointer", "pointer"],
    "result": "pointer",
  },
  "TTF_CloseFont": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "TTF_Quit": {
    "parameters": [],
    "result": "i32",
  },
});

let context_alive = false;
function init() {
  if (context_alive) {
    return;
  }
  context_alive = true;
  const result = sdl2.symbols.SDL_Init(0);
  if (result != 0) {
    const errPtr = sdl2.symbols.SDL_GetError();
    const view = new Deno.UnsafePointerView(errPtr);
    throw new Error(`SDL_Init failed: ${view.getCString()}`);
  }

  const platform = sdl2.symbols.SDL_GetPlatform();
  const view = new Deno.UnsafePointerView(platform);
  console.log(`SDL2 initialized on ${view.getCString()}`);
  // Initialize subsystems
  // SDL_INIT_EVENTS
  {
    const result = sdl2.symbols.SDL_InitSubSystem(0x00000001);
    if (result != 0) {
      const errPtr = sdl2.symbols.SDL_GetError();
      const view = new Deno.UnsafePointerView(errPtr);
      throw new Error(`SDL_InitSubSystem failed: ${view.getCString()}`);
    }
  }
  // SDL_INIT_VIDEO
  {
    const result = sdl2.symbols.SDL_InitSubSystem(0x00000010);
    if (result != 0) {
      const errPtr = sdl2.symbols.SDL_GetError();
      const view = new Deno.UnsafePointerView(errPtr);
      throw new Error(`SDL_InitSubSystem failed: ${view.getCString()}`);
    }
  }
  // SDL_INIT_IMAGE
  {
    const result = sdl2.symbols.SDL_InitSubSystem(0x00000004);
    if (result != 0) {
      const errPtr = sdl2.symbols.SDL_GetError();
      const view = new Deno.UnsafePointerView(errPtr);
      throw new Error(`SDL_InitSubSystem failed: ${view.getCString()}`);
    }
  }
  // IMG_Init
  {
    // TIF = 4, WEBP = 8
    sdl2Image.symbols.IMG_Init(1 | 2); // png and jpg
  }
  // SDL_INIT_TTF
  {
    const result = sdl2.symbols.SDL_InitSubSystem(0x00000100);
    if (result != 0) {
      const errPtr = sdl2.symbols.SDL_GetError();
      const view = new Deno.UnsafePointerView(errPtr);
      throw new Error(`SDL_InitSubSystem failed: ${view.getCString()}`);
    }
  }
  // TTF_Init
  {
    sdl2Font.symbols.TTF_Init();
  }
}

init();

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

const _raw = Symbol("raw");
function asCString(str: string): Uint8Array {
  // @ts-ignore: Deno.core is not public API.
  return Deno.core.encode(`${str}\0`);
}

function throwSDLError(): never {
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
      throwSDLError();
    }
  }

  clear() {
    const ret = sdl2.symbols.SDL_RenderClear(this.target);
    if (ret < 0) {
      throwSDLError();
    }
  }

  present() {
    sdl2.symbols.SDL_RenderPresent(this.target);
  }

  drawPoint(x: number, y: number) {
    const ret = sdl2.symbols.SDL_RenderDrawPoint(this.target, x, y);
    if (ret < 0) {
      throwSDLError();
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
      throwSDLError();
    }
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    const ret = sdl2.symbols.SDL_RenderDrawLine(this.target, x1, y1, x2, y2);
    if (ret < 0) {
      throwSDLError();
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
      throwSDLError();
    }
  }

  drawRect(x: number, y: number, w: number, h: number) {
    const intArray = new Int32Array([x, y, w, h]);
    const ret = sdl2.symbols.SDL_RenderDrawRect(
      this.target,
      Deno.UnsafePointer.of(intArray),
    );
    if (ret < 0) {
      throwSDLError();
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
      throwSDLError();
    }
  }

  fillRect(x: number, y: number, w: number, h: number) {
    const intArray = new Int32Array([x, y, w, h]);
    const ret = sdl2.symbols.SDL_RenderFillRect(
      this.target,
      Deno.UnsafePointer.of(intArray),
    );
    if (ret < 0) {
      throwSDLError();
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
      throwSDLError();
    }
  }

  copy(texture: Texture, source?: Rect, dest?: Rect) {
    const ret = sdl2.symbols.SDL_RenderCopy(
      this.target,
      texture[_raw],
      source ? source[_raw] : null,
      dest ? dest[_raw] : null,
    );
    if (ret < 0) {
      throwSDLError();
    }
  }

  textureCreator() {
    return new TextureCreator(this.target);
  }

  loadFont(path: string, size: number) {
    const raw = sdl2Font.symbols.TTF_OpenFont(asCString(path), size);
    return new Font(raw);
  }
}

export class Font {
  [_raw]: Deno.UnsafePointer;
  constructor(raw: Deno.UnsafePointer) {
    this[_raw] = raw;
  }

  renderSolid(text: string, color: Color) {
    const raw = sdl2Font.symbols.TTF_RenderText_Solid(
      this[_raw],
      asCString(text),
      color[_raw],
    );
    return new Texture(raw);
  }

  renderBlended(text: string, color: Color) {
    const raw = sdl2Font.symbols.TTF_RenderText_Blended(
      this[_raw],
      asCString(text),
      color[_raw],
    );
    return new Texture(raw);
  }
}

export class Color {
  [_raw]: Deno.UnsafePointer;
  constructor(r: number, g: number, b: number, a: number = 0xff) {
    const raw = new Uint8Array([r, g, b, a]);
    this[_raw] = Deno.UnsafePointer.of(raw);
  }
}

export enum PixelFormat {
  Unknown = 0,
  Index1LSB = 286261504,
  Index1MSB = 287310080,
  Index4LSB = 303039488,
  Index4MSB = 304088064,
  Index8 = 318769153,
  RGB332 = 336660481,
  XRGB4444 = 353504258,
  XBGR4444 = 357698562,
  XRGB1555 = 353570562,
  XBGR1555 = 357764866,
  ARGB4444 = 355602434,
  RGBA4444 = 356651010,
  ABGR4444 = 359796738,
  BGRA4444 = 360845314,
  ARGB1555 = 355667970,
  RGBA5551 = 356782082,
  ABGR1555 = 359862274,
  BGRA5551 = 360976386,
  RGB565 = 353701890,
  BGR565 = 357896194,
  RGB24 = 386930691,
  BGR24 = 390076419,
  XRGB8888 = 370546692,
  RGBX8888 = 371595268,
  XBGR8888 = 374740996,
  BGRX8888 = 375789572,
  ARGB8888 = 372645892,
  RGBA8888 = 373694468,
  ABGR8888 = 376840196,
  BGRA8888 = 377888772,
  ARGB2101010 = 372711428,
  YV12 = 842094169,
  IYUV = 1448433993,
  YUY2 = 844715353,
  UYVY = 1498831189,
  YVYU = 1431918169,
}

export enum TextureAccess {
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
      throwSDLError();
    }
    return new Texture(raw);
  }

  createTextureFromSurface(surface: Surface): Texture {
    const raw = sdl2.symbols.SDL_CreateTextureFromSurface(
      this.raw,
      surface[_raw],
    );
    if (raw === null) {
      throwSDLError();
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
  [_raw]: Deno.UnsafePointer;

  constructor(private raw: Deno.UnsafePointer) {
    this[_raw] = raw;
  }

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
      throwSDLError();
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
      throwSDLError();
    }
  }

  setAlphaMod(a: number) {
    const ret = sdl2.symbols.SDL_SetTextureAlphaMod(this.raw, a);
    if (ret < 0) {
      throwSDLError();
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
      throwSDLError();
    }
  }
}

export class Rect {
  [_raw]: Uint32Array;
  constructor(x: number, y: number, w: number, h: number) {
    this[_raw] = new Uint32Array([x, y, w, h]);
  }

  get x() {
    return this[_raw][0];
  }

  get y() {
    return this[_raw][1];
  }

  get width() {
    return this[_raw][2];
  }

  get height() {
    return this[_raw][3];
  }
}

export class Surface {
  [_raw]: Deno.UnsafePointer;
  constructor(raw: Deno.UnsafePointer) {
    this[_raw] = raw;
  }

  static fromFile(path: string): Surface {
    const raw = sdl2Image.symbols.IMG_Load(asCString(path));
    if (raw === null) {
      throwSDLError();
    }
    return new Surface(raw);
  }

  static loadBmp(path: string): Surface {
    const raw = sdl2.symbols.SDL_LoadBMP_RW(asCString(path));
    if (raw === null) {
      throwSDLError();
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

// deno-lint-ignore no-unused-vars
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

// deno-lint-ignore no-explicit-any
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
      0x2FFF0000,
      0x2FFF0000,
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
