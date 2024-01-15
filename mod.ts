import {
  i32,
  SizedFFIType,
  Struct,
  u16,
  u32,
  u64,
  u8,
  cstring,
} from "https://deno.land/x/byte_type@0.1.7/ffi.ts";

let DENO_SDL2_PATH: string | undefined;
try {
  DENO_SDL2_PATH = Deno.env.get("DENO_SDL2_PATH");
} catch (_) {
  // ignore, this can only fail if permission is not given
}

function isMacos() {
  return Deno.build.os === "darwin";
}

function isLinux() {
  return Deno.build.os === "linux";
}

function isWindows() {
  return Deno.build.os === "windows";
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
      "buffer",
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
      "buffer",
      "buffer",
      "buffer",
      "buffer",
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
    "parameters": ["pointer", "pointer", "buffer", "i32"],
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
  "SDL_GetWindowWMInfo": {
    "parameters": ["pointer", "pointer"],
    "result": "i32",
  },
  "SDL_GetVersion": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_Metal_CreateView": {
    "parameters": ["pointer"],
    "result": "pointer",
  },
  "SDL_RaiseWindow": {
    "parameters": ["pointer"],
    "result": "i32",
  },
  "SDL_GetKeyName": {
    "parameters": ["i32"],
    "result": "pointer",
  },
  "SDL_StartTextInput": {
    "parameters": [],
    "result": "i32",
  },
  "SDL_StopTextInput": {
    "parameters": [],
    "result": "i32",
  },
});

const SDL2_Image_symbols = {
  "IMG_Init": {
    "parameters": ["u32"],
    "result": "u32",
  },
  "IMG_Load": {
    "parameters": ["buffer"],
    "result": "pointer",
  },
} as const;

const SDL2_TTF_symbols = {
  "TTF_Init": {
    "parameters": [],
    "result": "u32",
  },
  "TTF_OpenFont": {
    "parameters": ["buffer", "i32"],
    "result": "pointer",
  },
  "TTF_RenderText_Solid": {
    "parameters": ["pointer", "buffer", "pointer"],
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
} as const;

let sdl2Image: Deno.DynamicLibrary<typeof SDL2_Image_symbols>,
  sdl2Font: Deno.DynamicLibrary<typeof SDL2_TTF_symbols>;

try {
  sdl2Image = Deno.dlopen(getLibraryPath("SDL2_image"), SDL2_Image_symbols);
} catch (_e) {
  console.log("SDL2_image not loaded. Some features will not be available.");
}

try {
  sdl2Font = Deno.dlopen(getLibraryPath("SDL2_ttf"), SDL2_TTF_symbols);
} catch (_e) {
  console.log("SDL2_ttf not loaded. Some features will not be available.");
}

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
    sdl2Image?.symbols.IMG_Init(1 | 2); // png and jpg
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
    sdl2Font?.symbols.TTF_Init();
  }
}

init();
/**
 * An enum that contains structures for the different event types.
 */
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
  TextEditing = 0x302,
  TextInput = 0x303,
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
const enc = new TextEncoder();

function asCString(str: string): Uint8Array {
  return enc.encode(`${str}\0`);
}

function throwSDLError(): never {
  const error = sdl2.symbols.SDL_GetError();
  const view = Deno.UnsafePointerView.getCString(error);
  throw new Error(`SDL Error: ${view}`);
}

/**
 * SDL2 canvas.
 */
export class Canvas {
  constructor(
    private window: Deno.PointerValue,
    private target: Deno.PointerValue,
  ) {}

  /**
   * Set the color used for drawing operations (Rect, Line and Clear).
   * @param r the red value used to draw on the rendering target
   * @param g the green value used to draw on the rendering target
   * @param b the blue value used to draw on the rendering target
   * @param a the alpha value used to draw on the rendering target; usually SDL_ALPHA_OPAQUE (255).
   */
  setDrawColor(r: number, g: number, b: number, a: number) {
    const ret = sdl2.symbols.SDL_SetRenderDrawColor(this.target, r, g, b, a);
    if (ret < 0) {
      throwSDLError();
    }
  }

  /**
   * Clear the current rendering target with the drawing color.
   */
  clear() {
    const ret = sdl2.symbols.SDL_RenderClear(this.target);
    if (ret < 0) {
      throwSDLError();
    }
  }
  /**
   * Update the screen with any rendering performed since the previous call.
   */
  present() {
    sdl2.symbols.SDL_RenderPresent(this.target);
  }

  /**
   * Draw a point on the current rendering target.
   * @param x the x coordinate of the point
   * @param y the y coordinate of the point
   */
  drawPoint(x: number, y: number) {
    const ret = sdl2.symbols.SDL_RenderDrawPoint(this.target, x, y);
    if (ret < 0) {
      throwSDLError();
    }
  }

  /**
   * Draw multiple points on the current rendering target.
   * @param points an array of Points (x, y) structures that represent the points to draw
   */
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

  /**
   * Draw a line on the current rendering target.
   * @param x1 the x coordinate of the start point
   * @param y1 the y coordinate of the start point
   * @param x2 the x coordinate of the end point
   * @param y2 the y coordinate of the end point
   */
  drawLine(x1: number, y1: number, x2: number, y2: number) {
    const ret = sdl2.symbols.SDL_RenderDrawLine(this.target, x1, y1, x2, y2);
    if (ret < 0) {
      throwSDLError();
    }
  }

  /**
   * Draw a series of connected lines on the current rendering target.
   * @param points an array of Points (x, y) structures representing points along the lines
   */
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

  /**
   * Draw a rectangle on the current rendering target.
   * @param x the x coordinate of the rectangle
   * @param y the y coordinate of the rectangle
   * @param w the width of the rectangle
   * @param h the height of the rectangle
   */

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

  /**
   * Draw some number of rectangles on the current rendering target.
   * @param rects an array of Rect (x, y, w, h) structures representing the rectangles to draw
   */
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

  /**
   * Fill a rectangle on the current rendering target with the drawing color.
   * @param x the x coordinate of the rectangle
   * @param y the y coordinate of the rectangle
   * @param w the width of the rectangle
   * @param h the height of the rectangle
   */
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

  /**
   * Fill some number of rectangles on the current rendering target with the drawing color.
   * @param rects an array of Rect (x, y, w, h) structures representing the rectangles to fill
   */
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

  /**
   * Copy a portion of the texture to the current rendering target.
   * @param texture the source texture
   * @param source the source rectangle, or null to copy the entire texture
   * @param dest the destination rectangle, or null for the entire rendering target; the texture will be stretched to fill the given rectangle
   */
  copy(texture: Texture, source?: Rect, dest?: Rect) {
    const ret = sdl2.symbols.SDL_RenderCopy(
      this.target,
      texture[_raw],
      source ? Deno.UnsafePointer.of(source[_raw]) : null,
      dest ? Deno.UnsafePointer.of(dest[_raw]) : null,
    );
    if (ret < 0) {
      throwSDLError();
    }
  }

  /**
   * TextureCreator is a helper class for creating textures.
   * @returns a TextureCreator object for use with creating textures
   */
  textureCreator() {
    return new TextureCreator(this.target);
  }

  /**
   * Create a font from a file, using a specified point size.
   * @param path the path to the font file
   * @param size point size to use for the newly-opened font
   * @returns a Font object for use with rendering text
   */
  loadFont(path: string, size: number) {
    const raw = sdl2Font.symbols.TTF_OpenFont(asCString(path), size);
    return new Font(raw);
  }
}

/**
 * Font is a helper class for rendering text.
 */
export class Font {
  [_raw]: Deno.UnsafePointer;
  constructor(raw: Deno.UnsafePointer) {
    this[_raw] = raw;
  }
  /**
   * Render a solid color version of the text.
   * @param text text to render, in Latin1 encoding.
   * @param color the foreground color of the text
   * @returns a Texture object
   */
  renderSolid(text: string, color: Color) {
    const raw = sdl2Font.symbols.TTF_RenderText_Solid(
      this[_raw],
      asCString(text),
      color[_raw],
    );
    return new Texture(raw);
  }

  /**
   * Render text at high quality to a new ARGB surface.
   * @param text text to render, in Latin1 encoding.
   * @param color the foreground color of the text
   * @returns a Texture object
   */
  renderBlended(text: string, color: Color) {
    const raw = sdl2Font.symbols.TTF_RenderText_Blended(
      this[_raw],
      asCString(text),
      color[_raw],
    );
    return new Texture(raw);
  }
}

/**
 * Color is a helper class for representing colors.
 */
export class Color {
  [_raw]: Deno.UnsafePointer;
  constructor(r: number, g: number, b: number, a: number = 0xff) {
    const raw = new Uint8Array([r, g, b, a]);
    this[_raw] = Deno.UnsafePointer.of(raw);
  }
}
/**
 * A structure that contains pixel format information.
 * @see https://wiki.libsdl.org/SDL2/SDL_PixelFormat
 */
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

/**
 * An enumeration of texture access patterns.
 * @see https://wiki.libsdl.org/SDL2/SDL_TextureAccess
 */
export enum TextureAccess {
  Static = 0,
  Streaming = 1,
  Target = 2,
}

/**
 * A class used to create textures.
 */
export class TextureCreator {
  constructor(private raw: Deno.UnsafePointer) {}

  /**
   * Create a texture for a rendering context.
   * @param format the format of the texture
   * @param access one of the enumerated values in TextureAccess or a number
   * @param w the width of the texture in pixels
   * @param h the height of the texture in pixels
   * @returns a Texture object
   *
   * @example
   * ```ts
   * const creator = canvas.textureCreator();
   * const texture = creator.createTexture(
   *  PixelFormat.RGBA8888,
   *  TextureAccess.Static,
   *  640,
   *  480,
   * );
   * ```
   */
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

  /**
   * Create a texture from a surface.
   * @param surface the surface used to create the texture
   * @returns a Texture object
   */

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

/**
 * An interface that contains information about a texture.
 */
export interface TextureQuery {
  format: number;
  access: TextureAccess;
  w: number;
  h: number;
}

/**
 * A structure that contains an efficient, driver-specific representation of pixel data.
 * @see https://wiki.libsdl.org/SDL2/SDL_Texture
 */
export class Texture {
  [_raw]: Deno.UnsafePointer;

  constructor(private raw: Deno.UnsafePointer) {
    this[_raw] = raw;
  }

  /**
   * Query the attributes of a texture.
   * @returns a TextureQuery
   */
  query(): TextureQuery {
    const format = new Uint32Array(1);
    const access = new Uint32Array(1);
    const w = new Uint32Array(1);
    const h = new Uint32Array(1);

    const ret = sdl2.symbols.SDL_QueryTexture(
      this.raw,
      format,
      access,
      w,
      h,
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
  /**
   * Set an additional color value multiplied into render copy operations.
   * @param r the red color value
   * @param g the green color value
   * @param b the blue color value
   */
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
  /**
   * Set an additional alpha value multiplied into render copy operations.
   * @param a the source alpha value multiplied into copy operations
   */
  setAlphaMod(a: number) {
    const ret = sdl2.symbols.SDL_SetTextureAlphaMod(this.raw, a);
    if (ret < 0) {
      throwSDLError();
    }
  }

  /**
   * Update the given texture rectangle with new pixel data.
   * @param pixels the raw pixel data in the format of the texture
   * @param pitch the number of bytes in a row of pixel data, including padding between lines
   * @param rect an Rect representing the area to update, or null to update the entire texture
   */
  update(pixels: Uint8Array, pitch: number, rect?: Rect) {
    const ret = sdl2.symbols.SDL_UpdateTexture(
      this.raw,
      rect ? rect[_raw] : null,
      pixels,
      pitch,
    );
    if (ret < 0) {
      throwSDLError();
    }
  }
}

/**
 * A structure that contains the definition of a rectangle, with the origin at the upper left.
 * @see https://wiki.libsdl.org/SDL2/SDL_Rect
 */
export class Rect {
  [_raw]: Uint32Array;
  constructor(x: number, y: number, w: number, h: number) {
    this[_raw] = new Uint32Array([x, y, w, h]);
  }
  /**
   * The x coordinate of the rectangle.
   */
  get x() {
    return this[_raw][0];
  }
  /**
   * The y coordinate of the rectangle.
   */
  get y() {
    return this[_raw][1];
  }
  /**
   * The width of the rectangle.
   */
  get width() {
    return this[_raw][2];
  }
  /**
   * The height of the rectangle.
   */
  get height() {
    return this[_raw][3];
  }
}
/**
 * A structure that contains a collection of pixels used in software blitting.
 */
export class Surface {
  [_raw]: Deno.UnsafePointer;
  constructor(raw: Deno.UnsafePointer) {
    this[_raw] = raw;
  }

  /**
   * Create a surface from a file.
   * @param path the path to the image file
   * @returns a Surface
   */
  static fromFile(path: string): Surface {
    if (!sdl2Image) {
      throw new Error("SDL2_image was not loaded");
    }

    const raw = sdl2Image.symbols.IMG_Load(asCString(path));
    if (raw === null) {
      throwSDLError();
    }
    return new Surface(raw);
  }
  /**
   * @param path the path to the bmp (bitmap) file
   * @returns a Surface
   */
  static loadBmp(path: string): Surface {
    if (!sdl2Image) {
      throw new Error("SDL2_image was not loaded");
    }

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
  mod: u16,
  unicode: u32,
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

const SDL_Version = new Struct({
  major: u8,
  minor: u8,
  patch: u8,
});

const SDL_SysWMInfo = new Struct({
  version: SDL_Version,
  subsystem: u32,
  window: u64,
});

const SDL_TextEditingEvent = new Struct({
  type: u32,
  timestamp: u32,
  windowID: u32,
  text: cstring,
  start: i32,
  length: i32,
});

const SDL_TextInputEvent = new Struct({
  type: u32,
  timestamp: u32,
  windowID: u32,
  text: cstring,
});

/* bug in byte_type@0.1.7 where SDL_SysWMInfo.size is NaN */
const sizeOfSDL_SysWMInfo = 3 + 4 + 8 * 64;
const wmInfoBuf = new Uint8Array(sizeOfSDL_SysWMInfo);

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
  [EventType.TextEditing]: makeReader(SDL_TextEditingEvent),
  [EventType.TextInput]: makeReader(SDL_TextInputEvent),
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

export function getKeyName(key: number) {
  const name = sdl2.symbols.SDL_GetKeyName(key);
  const view = new Deno.UnsafePointerView(name);
  return view.getCString();
}

export function startTextInput() {
  sdl2.symbols.SDL_StartTextInput();
}

export function stopTextInput() {
  sdl2.symbols.SDL_StopTextInput();
}

/**
 * A window.
 */
export class Window {
  constructor(
    private raw: Deno.PointerValue,
    private metalView: Deno.PointerValue | null,
  ) {}

  /**
   * Create a 2D rendering context for a window.
   * @returns a valid rendering context (Canvas)
   */
  canvas() {
    // Hardware accelerated canvas
    const raw = sdl2.symbols.SDL_CreateRenderer(this.raw, -1, 0);
    return new Canvas(this.raw, raw);
  }

  raise() {
    sdl2.symbols.SDL_RaiseWindow(this.raw);
  }

  /**
   * Return the raw handle of the window.
   *
   * platform: "cocoa" | "win32" | "winrt" | "x11" | "wayland"
   *
   * ```ts
   * const [platform, handle, display] = window.rawHandle();
   * ```
   *
   * on macOS:
   * - platform: "cocoa"
   * - handle: NSWindow
   * - display: MTKView
   *
   * on Windows:
   * - platform: "win32" | "winrt"
   * - handle: HWND
   * - display: null | HINSTANCE
   *
   * on Linux:
   * - platform: "x11" | "wayland"
   * - handle: Window
   * - display: Display
   */
  rawHandle(): [string, Deno.PointerValue, Deno.PointerValue | null] {
    const wm_info = Deno.UnsafePointer.of(wmInfoBuf);

    // Initialize the version info.
    sdl2.symbols.SDL_GetVersion(wm_info);

    const handle = sdl2.symbols.SDL_GetWindowWMInfo(this.raw, wm_info);
    if (handle == 0) {
      throwSDLError();
    }

    const view = new Deno.UnsafePointerView(wm_info!);

    const subsystem = view.getUint32(4); // u32

    if (isMacos()) {
      const SDL_SYSWM_COCOA = 4;

      const window = view.getPointer(4 + 4); // usize
      if (subsystem != SDL_SYSWM_COCOA) {
        throw new Error("Expected SDL_SYSWM_COCOA on macOS");
      }
      return ["cocoa", window, this.metalView];
    }

    if (isWindows()) {
      const SDL_SYSWM_WINDOWS = 1;
      const SDL_SYSWM_WINRT = 8;

      const window = view.getPointer(4 + 4); // usize
      if (subsystem == SDL_SYSWM_WINDOWS) {
        const hinstance = view.getPointer(4 + 4 + 8 + 8); // usize (gap of 8 bytes)
        return ["win32", window, hinstance];
      } else if (subsystem == SDL_SYSWM_WINRT) {
        return ["winrt", window, null];
      }
      throw new Error(
        "Expected SDL_SYSWM_WINRT or SDL_SYSWM_WINDOWS on Windows",
      );
    }

    if (isLinux()) {
      const SDL_SYSWM_X11 = 2;
      const SDL_SYSWM_WAYLAND = 6;

      const display = view.getPointer(4 + 4); // usize
      if (subsystem == SDL_SYSWM_X11) {
        const window = view.getPointer(4 + 4 + 8); // usize
        return ["x11", window, display];
      } else if (subsystem == SDL_SYSWM_WAYLAND) {
        const surface = view.getPointer(4 + 4 + 8); // usize
        return ["wayland", surface, display];
      }
      throw new Error("Expected SDL_SYSWM_X11 or SDL_SYSWM_WAYLAND on Linux");
    }

    throw new Error("Unsupported platform");
  }

  /**
   * Events from the window.
   */
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

  [Symbol.dispose]() {
    sdl2.symbols.SDL_DestroyWindow(this.raw);
  }
}

// Copied from https://github.com/libsdl-org/SDL/blob/main/include/SDL3/SDL_video.h#L129 on 6/13/2023
enum WINDOW_FLAGS {
  FULLSCREEN = 0x00000001, /**< window is in fullscreen mode */
  OPENGL = 0x00000002, /**< window usable with OpenGL context */
  HIDDEN = 0x00000008, /**< window is not visible */
  BORDERLESS = 0x00000010, /**< no window decoration */
  RESIZABLE = 0x00000020, /**< window can be resized */
  MINIMIZED = 0x00000040, /**< window is minimized */
  MAXIMIZED = 0x00000080, /**< window is maximized */
  MOUSE_GRABBED = 0x00000100, /**< window has grabbed mouse input */
  INPUT_FOCUS = 0x00000200, /**< window has input focus */
  MOUSE_FOCUS = 0x00000400, /**< window has mouse focus */
  FOREIGN = 0x00000800, /**< window not created by SDL */
  HIGH_PIXEL_DENSITY =
    0x00002000, /**< window uses high pixel density back buffer if possible */
  MOUSE_CAPTURE =
    0x00004000, /**< window has mouse captured (unrelated to MOUSE_GRABBED) */
  ALWAYS_ON_TOP = 0x00008000, /**< window should always be above others */
  SKIP_TASKBAR = 0x00010000, /**< window should not be added to the taskbar */
  UTILITY = 0x00020000, /**< window should be treated as a utility window */
  TOOLTIP = 0x00040000, /**< window should be treated as a tooltip */
  POPUP_MENU = 0x00080000, /**< window should be treated as a popup menu */
  KEYBOARD_GRABBED = 0x00100000, /**< window has grabbed keyboard input */
  VULKAN = 0x10000000, /**< window usable for Vulkan surface */
  METAL = 0x20000000, /**< window usable for Metal view */
  TRANSPARENT = 0x40000000, /**< window with transparent buffer */
}

/**
 * A window builder to create a window.
 * @example
 * ```ts
 * const window = new WindowBuilder("Hello World", 800, 600);
 * ```
 */
export class WindowBuilder {
  private flags: number = 0;
  constructor(
    private title: string,
    private width: number,
    private height: number,
  ) {}

  /**
   * Build a window.
   * @returns a window
   */
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

    if (window === null) {
      throwSDLError();
    }

    const metal_view = isMacos()
      ? sdl2.symbols.SDL_Metal_CreateView(window)
      : null;
    return new Window(window, metal_view);
  }

  /**
   * Set the window to be fullscreen.
   */
  fullscreen() {
    this.flags |= WINDOW_FLAGS.FULLSCREEN;
    return this;
  }

  /**
   * Window usable with an OpenGL context
   */
  opengl() {
    this.flags |= WINDOW_FLAGS.OPENGL;
    return this;
  }

  /** window is not visible */
  hidden() {
    this.flags |= WINDOW_FLAGS.HIDDEN;
    return this;
  }

  /**
   * Set the window to be borderless.
   */
  borderless() {
    this.flags |= WINDOW_FLAGS.BORDERLESS;
    return this;
  }

  /**
   * Set the window to be resizable.
   */
  resizable() {
    this.flags |= WINDOW_FLAGS.RESIZABLE;
    return this;
  }

  /** window is minimized */
  minimized() {
    this.flags |= WINDOW_FLAGS.MINIMIZED;
    return this;
  }

  /** window is maximized */
  maximized() {
    this.flags |= WINDOW_FLAGS.MAXIMIZED;
    return this;
  }

  /** window has grabbed mouse input */
  mouseGrabbed() {
    this.flags |= WINDOW_FLAGS.MOUSE_GRABBED;
    return this;
  }

  /** window has input focus */
  inputFocus() {
    this.flags |= WINDOW_FLAGS.INPUT_FOCUS;
    return this;
  }

  /** window has mouse focus */
  mouseFocus() {
    this.flags |= WINDOW_FLAGS.MOUSE_FOCUS;
    return this;
  }

  /**
   * Set the window to be a foreign window.
   */
  foreign() {
    this.flags |= WINDOW_FLAGS.FOREIGN;
    return this;
  }

  /**
   * Window should be created in high-DPI mode.
   */
  highPixelDensity() {
    this.flags |= WINDOW_FLAGS.HIGH_PIXEL_DENSITY;
    return this;
  }

  /** window has mouse captured (unrelated to MOUSE_GRABBED) */
  mouseCapture() {
    this.flags |= WINDOW_FLAGS.MOUSE_CAPTURE;
    return this;
  }

  /**
   * Set the window to be always on top.
   */
  alwaysOnTop() {
    this.flags |= WINDOW_FLAGS.ALWAYS_ON_TOP;
    return this;
  }

  /** window should not be added to the taskbar */
  skipTaskbar() {
    this.flags |= WINDOW_FLAGS.SKIP_TASKBAR;
    return this;
  }

  /** window should be treated as a utility window */
  utility() {
    this.flags |= WINDOW_FLAGS.UTILITY;
    return this;
  }

  /** window should be treated as a tooltip */
  tooltip() {
    this.flags |= WINDOW_FLAGS.TOOLTIP;
    return this;
  }

  /** window should be treated as a popup menu */
  popupMenu() {
    this.flags |= WINDOW_FLAGS.POPUP_MENU;
    return this;
  }

  /** window has grabbed keyboard input */
  keyboardGrabbed() {
    this.flags |= WINDOW_FLAGS.KEYBOARD_GRABBED;
    return this;
  }

  /** window usable for Vulkan surface */
  vulkan() {
    this.flags |= WINDOW_FLAGS.VULKAN;
    return this;
  }

  /** window usable for Metal view */
  metal() {
    this.flags |= WINDOW_FLAGS.METAL;
    return this;
  }

  /** window with transparent buffer */
  transparent() {
    this.flags |= WINDOW_FLAGS.TRANSPARENT;
    return this;
  }
}
/**
 * A video subsystem.
 */
export class VideoSubsystem {
  /**
   * Get the name of the currently initialized video driver.
   */
  currentVideoDriver(): string {
    const buf = sdl2.symbols.SDL_GetCurrentVideoDriver();
    if (buf === null) {
      throwSDLError();
    }
    const view = new Deno.UnsafePointerView(buf);
    return view.getCString();
  }
}
