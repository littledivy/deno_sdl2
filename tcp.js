import { decodeConn, encode, readStatus } from "./msg.ts";

class Window extends EventTarget {
  #properties;
  #tasks = [];

  constructor(properties) {
    super();
    this.#properties = properties;
  }

  present() {
    this.#tasks.push("present");
  }

  clear() {
    this.#tasks.push("clear");
  }

  setDrawColor(r, g, b, a) {
    this.#tasks.push({ setDrawColor: { r, g, b, a } });
  }

  quit() {
    this.#tasks.push("quit");
  }

  async start() {
    init(async (conn) => {
      const window = encode(this.#properties);
      await conn.write(window);

      const videoReqBuf = await readStatus(conn);

      switch (videoReqBuf) {
        case 1:
          // CANVAS_READY
          const canvas = encode({
            software: false,
          });
          await conn.write(canvas);
          // SDL event_pump
          while (true) {
            const canvasReqBuf = await readStatus(conn);

            switch (canvasReqBuf) {
              case 2:
                // CANVAS_LOOP_ACTION
                const tasks = encode(this.#tasks);
                await conn.write(tasks);
                this.#tasks = [];
                await conn.write(new Uint8Array([1]));
                break;
              case 3:
                // EVENT_PUMP
                const e = await decodeConn(conn);
                const event = new CustomEvent("event", { detail: e });
                this.dispatchEvent(event);
                break;
              default:
                await conn.write(encode(["none"]));
                await conn.write(new Uint8Array([1]));
                break;
            }
          }
          break;
        // TODO(littledivy): CANVAS_ERR
        default:
          break;
      }
    });
  }
}

async function init(cb) {
  const listener = Deno.listen({ port: 34254, transport: "tcp" });

  console.log("listening on 0.0.0.0:34254");

  for await (const conn of listener) {
    const reqBuf = await readStatus(conn);

    switch (reqBuf) {
      case 0:
        // VIDEO_READY
        await cb(conn);
        break;
      default:
        break;
    }
  }
}

const window = new Window({
  title: "Hello, Deno!",
  height: 800,
  width: 600,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: false,
  minimized: false,
  maximized: false,
});

window.addEventListener("event", (e) => {
  if (e.detail == "Quit") {
    window.quit();
  }
  console.log(e.detail);
});

window.setDrawColor(0, 64, 255, 0);
window.clear();
window.present();

await window.start();
