import { Canvas, Rectangle, Texture } from "../../mod.ts";

export function drawMap(
  texture: Texture,
  canvas: Canvas,
  map: number[][],
  chipSize: number,
) {
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const chip = map[i][j];

      canvas.copy(
        texture,
        {
          x: (chip % 4) * chipSize,
          y: ((chip / 4) | 0) * chipSize,
          width: chipSize,
          height: chipSize,
        },
        {
          x: j * chipSize * 4,
          y: i * chipSize * 4,
          width: chipSize * 4,
          height: chipSize * 4,
        },
      );
    }
  }
}

export class Sprite {
  x = 0;
  y = 0;
  z = 0;
  vx = 0;
  vy = 0;
  originX = 0;
  originY = 0;
  scale = 1;
  texture: Texture;
  frames: Rectangle[];
  index = 0;

  constructor(texture: Texture, frames: Rectangle[]) {
    this.texture = texture;
    this.frames = frames;
  }

  draw(dest: Canvas) {
    dest.copy(this.texture, this.frames[this.index], {
      x: this.x - this.originX,
      y: this.y - this.originY - this.z,
      width: this.frames[this.index].width * this.scale,
      height: this.frames[this.index].height * this.scale,
    });
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
  }

  wrap(width: number, height: number) {
    if (this.x < 0) {
      this.x += width;
    } else if (this.x > width) {
      this.x -= width;
    }

    if (this.y < 0) {
      this.y += height;
    } else if (this.y > height) {
      this.y -= height;
    }
  }
}
