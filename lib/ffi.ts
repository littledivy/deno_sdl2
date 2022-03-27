const library = Deno.dlopen("/opt/homebrew/lib/libSDL2.dylib", {
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
});

export { init, library as sdl2 };

let context_alive = false;
function init() {
  if (context_alive) {
    return;
  }
  context_alive = true;
  const result = library.symbols.SDL_Init(0);
  if (result != 0) {
    const errPtr = library.symbols.SDL_GetError();
    const view = new Deno.UnsafePointerView(errPtr);
    throw new Error(`SDL_Init failed: ${view.getCString()}`);
  }

  const platform = library.symbols.SDL_GetPlatform();
  const view = new Deno.UnsafePointerView(platform);
  console.log(`SDL2 initialized on ${view.getCString()}`);
  // Initialize subsystems
  // SDL_INIT_EVENTS
  {
    const result = library.symbols.SDL_InitSubSystem(0x00000001);
    if (result != 0) {
      const errPtr = library.symbols.SDL_GetError();
      const view = new Deno.UnsafePointerView(errPtr);
      throw new Error(`SDL_InitSubSystem failed: ${view.getCString()}`);
    }
  }
  // SDL_INIT_VIDEO
  {
    const result = library.symbols.SDL_InitSubSystem(0x00000010);
    if (result != 0) {
      const errPtr = library.symbols.SDL_GetError();
      const view = new Deno.UnsafePointerView(errPtr);
      throw new Error(`SDL_InitSubSystem failed: ${view.getCString()}`);
    }
  }
}
