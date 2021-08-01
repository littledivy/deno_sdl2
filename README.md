### Deno SDL2

Cross platform and stable bindings to SDL2 library. Have fun!

```javascript
const window = new Window({ title: "Hello, Deno!", width: 800, height: 400 });

window.addEventListener("event", (e) => {
  console.log(e.detail);
});

window.setDrawColor(0, 64, 255, 0);
window.clear();
window.present();

window.start();
```

#### License

MIT License
