### Deno SDL2

Cross platform and stable bindings to [SDL2](https://www.libsdl.org/index.php). Have fun!

![events](https://user-images.githubusercontent.com/34997667/127779178-a58d4cd6-2bf4-4d74-8e43-3b784799ab79.png)

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
