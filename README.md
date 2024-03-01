### Deno SDL2

deno_sdl2 provides bindings to sdl2, sdl2_ttf and sdl2_image.

https://user-images.githubusercontent.com/34997667/160436698-9045ba0c-3fc8-45f9-8038-4194e5d3dcc8.mov

### get started

```typescript
import { EventType, WindowBuilder } from "jsr:@divy/sdl2@0.10";

const window = new WindowBuilder("Hello, Deno!", 640, 480).build();
const canvas = window.canvas();

for (const event of window.events()) {
  if (event.type == EventType.Quit) {
    break;
  } else if (event.type == EventType.Draw) {
    // Rainbow effect
    const r = Math.sin(Date.now() / 1000) * 127 + 128;
    const g = Math.sin(Date.now() / 1000 + 2) * 127 + 128;
    const b = Math.sin(Date.now() / 1000 + 4) * 127 + 128;
    canvas.setDrawColor(Math.floor(r), Math.floor(g), Math.floor(b), 255);
    canvas.clear();
    canvas.present();
  }
}
```

```shell
~> deno run --allow-ffi --unstable https://jsr.io/@divy/sdl2/0.10.1/examples/hello.ts
```

### installing sdl2

Follow https://wiki.libsdl.org/Installation to install the dynamic library.

TL;DR

MacOS (arm64/x64):

```shell
brew install sdl2 sdl2_image sdl2_ttf
```

Make sure the libraries is in your system's library search paths, if not
already:

```shell
sudo ln -s /opt/homebrew/lib/libSDL2.dylib /usr/local/lib/
sudo ln -s /opt/homebrew/lib/libSDL2_image.dylib /usr/local/lib/
sudo ln -s /opt/homebrew/lib/libSDL2_ttf.dylib /usr/local/lib/
```

Additionally, you can set `DENO_SDL2_PATH` to point to the directory where these
three libraries are located.

Windows (x64):

Grab prebuilt libraries from:

- https://github.com/libsdl-org/SDL/releases/tag/release-2.28.5
- https://github.com/libsdl-org/SDL_image/releases/tag/release-2.8.1
- https://github.com/libsdl-org/SDL_ttf/releases/tag/release-2.0.18

Take `SDL2.dll`, `SDL2_image.dll` and `SDL2_ttf.dll` from each respectively and
put them into cwd or `C:\Windows\System32\`.

> Windows is expected to work but I do not accept Windows-specifc issues. Open a
> PR directly with a fix.

Linux (x64):

```shell
sudo apt install libsdl2-dev libsdl2-image-dev libsdl2-ttf-dev
```

### security

you need `--allow-ffi --unstable` to use SDL2. `deno_sdl2` needs access to
system's SDL2 library. Deno's permission model does not work well with FFI
libraries, use at your own risk.

### projects using `deno_sdl2`

- https://github.com/dhairy-online/dino-deno
- https://github.com/dhairy-online/flappybird
- https://github.com/load1n9/caviar

- ...insert your project here

### license

MIT
