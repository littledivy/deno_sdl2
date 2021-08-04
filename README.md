### Deno SDL2

Cross platform and stable bindings to [SDL2](https://www.libsdl.org/index.php).
Have fun!

![demo](https://user-images.githubusercontent.com/34997667/128133087-d5a66ca2-b4c5-4654-8f4f-5d4a33bf6258.png)

#### Features

- Bindings to Graphics and Font subsystem.
- API similar to `Rust-sdl2`
- Not `--unstable`. Uses TCP instead of Deno's traditional plugin system.

#### Usage

```typescript
const canvas = new Canvas({ title: "Hello, Deno!", width: 800, height: 400 });

canvas.addEventListener("event", (e: WindowEvent) => {
  console.log(e.detail);
});

canvas.setDrawColor(0, 64, 255, 0);
canvas.clear();
canvas.present();

canvas.start();
```

#### License

MIT License
