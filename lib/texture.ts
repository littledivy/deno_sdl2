import {
  query_texture_access,
  query_texture_format,
  query_texture_height,
  query_texture_width,
  update_texture,
} from "../bindings/bindings.ts";

export enum TextureAccess {
  Static,
  Streaming,
  Target,
}

export class Texture {
  constructor(
    public index: number,
  ) {}

  get width(): number {
    return query_texture_width(this.index);
  }

  get height(): number {
    return query_texture_height(this.index);
  }

  get access(): number {
    return query_texture_access(this.index);
  }

  get format(): number {
    return query_texture_format(this.index);
  }

  update(data: Uint8Array, pitch: number = this.width * 4) {
    update_texture(data, pitch, this.index);
  }
}
