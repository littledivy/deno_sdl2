### Deno SDL2

Cross platform and stable bindings to [SDL2](https://www.libsdl.org/index.php).
Have fun!

<img align="center" src=https://user-images.githubusercontent.com/62501544/128629366-9f5f4f23-5ec8-4246-b3a7-c540b7286a60.png width="450px">

#### Features

- Bindings to Video, Graphics, Font and Mixer subsystems. (Uses rodio instead of
  SDL2_Mixer)
- Not `--unstable`. Uses TCP instead of Deno's traditional plugin system.

#### Example

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

### License

MIT
