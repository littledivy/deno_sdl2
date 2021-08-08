### `Deno SDL2`

_Cross platform_ and _stable bindings_ to [SDL2](https://www.libsdl.org/index.php).
Have fun!
<img align="right" src=deno_sdl2(1).png height="240px">

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

Insert gif or link to demo!
    
### Authors

- [@littledivy](https://www.github.com/littledivy)
- [@breadA](https://www.github.com/dhairy-online)
  
### License
[MIT](https://opensource.org/licenses/MIT)

---

  
