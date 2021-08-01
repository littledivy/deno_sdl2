const encoder = new TextEncoder();
function encode(object) {
  const payload = encoder.encode(JSON.stringify(object));

  const buf = new Uint8Array(4 + payload.length);
  const view = new DataView(buf.buffer);
  view.setInt32(0, payload.byteLength, true);
  buf.set(payload, 4);

  return buf;
}

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
  
  async start() {
    init(async (conn) => {
      const window = encode(this.#properties);
      await conn.write(window);

      const videoReqBuf = new Uint8Array(1);
      await conn.read(videoReqBuf);

      switch (videoReqBuf[0]) {
        case 1:
          // CANVAS_READY
          const canvas = encode({
            software: false,
          });
          await conn.write(canvas);
          // SDL event_pump
          while (true) {
            const canvasReqBuf = new Uint8Array(1);
            await conn.read(canvasReqBuf);

            switch (canvasReqBuf[0]) {
              case 2:
                // CANVAS_LOOP_ACTION
                const tasks = encode(this.#tasks);
                await conn.write(tasks);
                this.#tasks = [];
                await conn.write(new Uint8Array([1]));
                break;
              case 3:
                // EVENT_PUMP
                const eventLengthBuffer = new Uint8Array(4);
                await conn.read(eventLengthBuffer);
                const view = new DataView(eventLengthBuffer.buffer, 0);
                const eventLength = view.getUint32(0, true);

                const eventBuffer = new Uint8Array(eventLength);
                await conn.read(eventBuffer);

                const e = JSON.parse(new TextDecoder().decode(eventBuffer));
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
    const reqBuf = new Uint8Array(1);
    await conn.read(reqBuf);

    switch (reqBuf[0]) {
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

window.addEventListener("event", e => {  
  console.log(e.detail);
});

window.setDrawColor(0, 64, 255, 0);
window.clear();
window.present();

window.start();
