import { Color } from "./pixel.ts";

export interface FontRenderOptions {
  solid?: { color: Color };
  shaded?: { color: Color; background: Color };
  blended?: { color: Color };
}
