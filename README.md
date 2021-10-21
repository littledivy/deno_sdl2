### Deno SDL2

Cross platform bindings to [SDL2](https://www.libsdl.org/index.php). Have fun!

<p align="center">
  <img src="examples/sprite/demo.png" data-tooltip="Ad" width="450px" style="border-radius: 15px">
</p>

### Features

- Bindings to Video, Graphics, Font and Mixer subsystems. (Uses rodio instead of
  SDL2_Mixer)
- Built on top of Deno's FFI API. Previous versions used TCP streams.

### Example

```typescript
import { Canvas } from "https://deno.land/x/sdl2/src/canvas.ts";

const canvas = new Canvas({ title: "Hello, Deno!", width: 800, height: 400 });

canvas.setDrawColor(0, 64, 255, 255);
canvas.clear();
canvas.present();

for await (const event of canvas) {
  switch (event.type) {
    case "draw":
      // Your game logic
      // ...
      break;
    case "mouse_motion":
      // Mouse stuff
      break;
    case "key_down":
      // Keyboard stuff
      break;
    // ...
    default:
      break;
  }
}
```

### Projects using `deno_sdl2`

- https://github.com/dhairy-online/dino-deno
- https://github.com/dhairy-online/flappybird
- ...insert your project here

### License

MIT
