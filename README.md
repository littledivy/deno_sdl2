### `Deno SDL2`

_Cross platform_ and _stable bindings_ to [SDL2](https://www.libsdl.org/index.php).
Have fun!


#### Features

- Bindings to Video, Graphics, Font and Mixer subsystems.
- API similar to `Rust-sdl2`
- Not `--unstable`. Uses TCP instead of Deno's traditional plugin system.

#### Example

##### Create canvas
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


#### Demo
<img align="center" src=https://user-images.githubusercontent.com/62501544/128629366-9f5f4f23-5ec8-4246-b3a7-c540b7286a60.png height="400px">
    
### Authors

- [@littledivy](https://www.github.com/littledivy)
- [@breadA](https://www.github.com/dhairy-online)
  
### License
[MIT](https://opensource.org/licenses/MIT)

---

  
