### Deno SDL2

Cross platform and stable bindings to [SDL2](https://www.libsdl.org/index.php).
Have fun!

![canvas_font_demo](https://user-images.githubusercontent.com/34997667/127973999-d0212cac-0800-46c8-8817-7e401fec69a6.png)


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
