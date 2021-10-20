import { Canvas } from "../src/canvas.ts";

const canvas = new Canvas({
  title: "Hello, Deno!",
  height: 800,
  width: 600,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: true,
  minimized: false,
  maximized: false,
  flags: null,
});

const boxes: any[] = [];
let num_boxes = 5;

function initBoxes() {
  for (let i = 0; i < num_boxes; i++) {
    boxes.push({
      x: Math.floor(Math.random() * 600),
      y: Math.floor(Math.random() * 800),
      dx: 1,
      dy: 50,
    });
  }
}

initBoxes();
function checkCollision(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
) {
  return !(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2);
}

async function frame() {
  canvas.setDrawColor(0, 0, 0, 255);
  canvas.clear();
  canvas.setDrawColor(255, 255, 255, 255);
  canvas.present();
  for (let i = 0; i < num_boxes; i++) {
    // Gravity
    boxes[i].dy += 2;

    boxes[i].x += boxes[i].dx;
    boxes[i].y += boxes[i].dy;

    // Bounce
    if (boxes[i].y + 20 > 800) {
      boxes[i].y = 800 - 20;
      boxes[i].dy = -Math.abs(boxes[i].dy);
    } else if (boxes[i].y - 20 < 0) {
      boxes[i].y = 20;
      boxes[i].dy = Math.abs(boxes[i].dy);
    }

    if (boxes[i].x + 20 > 600) {
      boxes[i].x = 600 - 20;
      boxes[i].dx = -Math.abs(boxes[i].dx);
    } else if (boxes[i].x - 20 < 0) {
      boxes[i].x = 20;
      boxes[i].dx = Math.abs(boxes[i].dx);
    }

    // Dampening
    boxes[i].dy -= boxes[i].dy <= 0 ? 0 : 1;
    boxes[i].dx -= boxes[i].dx <= 0 ? 0 : 1;

    // Collision with other boxes
    for (let j = 0; j < num_boxes; j++) {
      if (
        checkCollision(
          boxes[i].x,
          boxes[i].y,
          20,
          20,
          boxes[j].x,
          boxes[j].y,
          20,
          20,
        )
      ) {
        let dx = boxes[j].x - boxes[i].x;
        let dy = boxes[j].y - boxes[i].y;
        let d = Math.floor(Math.sqrt(dx * dx + dy * dy));

        if (d === 0) {
          d = 1;
        }
        let unitX = Math.floor(dx / d);
        let unitY = Math.floor(dy / d);

        let force = -2;

        let forceX = unitX * force;
        let forceY = unitY * force;

        boxes[i].dx += forceX;
        boxes[i].dy += forceY;

        boxes[j].dx -= forceX;
        boxes[j].dy -= forceY;
      }
    }

    canvas.fillRect(boxes[i].x, boxes[i].y, 20, 20);
  }

  canvas.present();
  Deno.sleepSync(10);
}
// Fire up the event loop
for await (const event of canvas) {
  switch (event.type) {
    case "draw":
      await frame();
      break;
    case "quit":
      canvas.quit();
      break;
    case "mouse_button_up":
      boxes.push({
        x: event.x,
        y: event.y,
        dx: 1,
        dy: 50,
      });
      num_boxes += 1;
      break;
  }
}
