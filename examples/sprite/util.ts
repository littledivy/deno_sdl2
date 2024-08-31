import { Canvas, Rect, Texture } from "../../mod.ts";

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function drawMap(
  texture: Texture,
  canvas: Canvas,
  map: number[][],
  chipSize: number,
): Rect[] {
  const frames: Rect[] = [];
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const chip = map[i][j];
      const src = new Rect(
        (chip % 4) * chipSize,
        ((chip / 4) | 0) * chipSize,
        chipSize,
        chipSize,
      );
      const dst = new Rect(
        i * chipSize * 4,
        j * chipSize * 4,
        chipSize * 4,
        chipSize * 4,
      );
      // 9 = cactus
      // 8 = normal tile
      if (chip === 9) frames.push(dst);
      canvas.copy(
        texture,
        src,
        dst,
      );
    }
  }
  return frames;
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
  frames: Rect[];
  index = 0;

  constructor(texture: Texture, frames: Rect[]) {
    this.texture = texture;
    this.frames = frames;
  }

  draw(dest: Canvas) {
    const dst = new Rect(
      this.x - this.originX,
      this.y - this.originY - this.z,
      this.frames[this.index].width * this.scale,
      this.frames[this.index].height * this.scale,
    );
    dest.copy(this.texture, this.frames[this.index], dst);
  }

  tick() {
    this.x += this.vx;
    this.y += this.vy;
  }

  wrap(rect: Area) {
    this.x = (this.x - rect.x) % rect.width + rect.x;
    this.y = (this.y - rect.y) % rect.height + rect.y;
  }
}
