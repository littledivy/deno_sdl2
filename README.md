### Deno SDL2

Cross platform and stable bindings to [SDL2](https://www.libsdl.org/index.php).
Have fun!

https://user-images.githubusercontent.com/34997667/127972960-e64db0ca-715b-4a08-a72e-0b2d4dcfc290.mp4

```typescript
const window = new Window({ title: "Hello, Deno!", width: 800, height: 400 });

window.addEventListener("event", (e: WindowEvent) => {
  console.log(e.detail);
});

window.setDrawColor(0, 64, 255, 0);
window.clear();
window.present();

window.start();
```

#### License

MIT License
