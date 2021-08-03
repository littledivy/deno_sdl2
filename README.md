### Deno SDL2

Cross platform and stable bindings to [SDL2](https://www.libsdl.org/index.php).
Have fun!

https://user-images.githubusercontent.com/34997667/127972262-769b9f64-efd6-4119-b8c5-404368bc6007.mp4

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
