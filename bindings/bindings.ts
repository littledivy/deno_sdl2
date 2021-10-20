// Auto-generated with deno_bindgen
import { Plug } from "https://deno.land/x/plug@0.4.0/mod.ts";
function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v;
  return new TextEncoder().encode(v);
}
const opts = {
  name: "deno_sdl2",
  url: "target/release",
};
const _lib = await Plug.prepare(opts, {
  init: {
    parameters: ["buffer", "usize", "buffer", "usize"],
    result: "void",
    nonblocking: false,
  },
  fill_events: {
    parameters: ["buffer", "usize"],
    result: "void",
    nonblocking: false,
  },
  do_task: {
    parameters: ["buffer", "usize"],
    result: "void",
    nonblocking: false,
  },
  poll_events: { parameters: [], result: "usize", nonblocking: false },
});
export type CanvasFontSize =
  | "normal"
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough";
export type CanvasColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};
export type CanvasPoint = {
  x: number;
  y: number;
};
export type OptionRectangle = {
  x: number;
  y: number;
  width: number | undefined | null;
  height: number | undefined | null;
};
export type CanvasTasks = {
  tasks: Array<CanvasTask>;
};
export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};
/**
 * https://docs.rs/sdl2/0.34.5/sdl2/video/struct.WindowBuilder.htm
 * Window Builder configuration
 */
export type WindowOptions = {
  title: string;
  height: number;
  width: number;
  flags: number | undefined | null;
  centered: boolean;
  fullscreen: boolean;
  hidden: boolean;
  resizable: boolean;
  minimized: boolean;
  maximized: boolean;
};
export type CanvasTask =
  | "present"
  | {
    setDrawColor: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }
  | {
    setScale: {
      x: number;
      y: number;
    };
  }
  | {
    drawPoint: {
      x: number;
      y: number;
    };
  }
  | {
    drawPoints: {
      points: Array<CanvasPoint>;
    };
  }
  | {
    drawLine: {
      p1: CanvasPoint;
      p2: CanvasPoint;
    };
  }
  | {
    drawLines: {
      points: Array<CanvasPoint>;
    };
  }
  | {
    drawRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }
  | {
    drawRects: {
      rects: Array<Rectangle>;
    };
  }
  | {
    fillRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }
  | {
    fillRects: {
      rects: Array<Rectangle>;
    };
  }
  | "clear"
  | "quit"
  | "none"
  | {
    renderFont: {
      text: string;
      options: CanvasFontPartial;
      target: OptionRectangle | undefined | null;
      path: string;
      size: number;
      style: CanvasFontSize | undefined | null;
    };
  }
  | {
    setCursor: {
      index: number;
      path: string;
    };
  }
  | {
    playMusic: {
      path: string;
    };
  }
  | {
    createSurface: {
      width: number;
      height: number;
      format: number;
      index: number;
    };
  }
  | {
    createSurfaceBitmap: {
      path: string;
      index: number;
    };
  }
  | {
    loadSurface: {
      path: string;
      index: number;
    };
  }
  | {
    createTexture: {
      format: number | undefined | null;
      access: number;
      width: number;
      height: number;
      index: number;
    };
  }
  | {
    createTextureSurface: {
      surface: number;
      index: number;
    };
  }
  | {
    loadTexture: {
      path: string;
      index: number;
    };
  }
  | {
    copyRect: {
      texture: number;
      rect1: Rectangle;
      rect2: Rectangle;
    };
  }
  | {
    setDisplayMode: {
      width: number;
      height: number;
      rate: number;
      format: number;
    };
  }
  | {
    setTitle: {
      title: string;
    };
  }
  | {
    setIcon: {
      icon: string;
    };
  }
  | {
    setPosition: {
      x: number;
      y: number;
    };
  }
  | {
    setSize: {
      width: number;
      height: number;
    };
  }
  | {
    setMinimumSize: {
      width: number;
      height: number;
    };
  }
  | "show"
  | "hide"
  | "raise"
  | "maximize"
  | "minimize"
  | "restore"
  | {
    setBrightness: {
      brightness: number;
    };
  }
  | {
    setOpacity: {
      opacity: number;
    };
  };
export type CanvasFontPartial =
  | {
    solid: {
      color: CanvasColor;
    };
  }
  | {
    shaded: {
      color: CanvasColor;
      background: CanvasColor;
    };
  }
  | {
    blended: {
      color: CanvasColor;
    };
  };
/**
 * https://rust-sdl2.github.io/rust-sdl2/sdl2/render/struct.CanvasBuilder.html
 * Canvas Builder configuration
 */
export type CanvasOptions = {
  software: boolean;
};
export function init(a0: WindowOptions, a1: CanvasOptions) {
  const a0_buf = encode(JSON.stringify(a0));
  const a1_buf = encode(JSON.stringify(a1));
  return _lib.symbols.init(
    a0_buf,
    a0_buf.byteLength,
    a1_buf,
    a1_buf.byteLength,
  ) as null;
}
export function fill_events(a0: Uint8Array) {
  const a0_buf = encode(a0);
  return _lib.symbols.fill_events(a0_buf, a0_buf.byteLength) as null;
}
export function do_task(a0: CanvasTasks) {
  const a0_buf = encode(JSON.stringify(a0));
  return _lib.symbols.do_task(a0_buf, a0_buf.byteLength) as null;
}
export function poll_events() {
  return _lib.symbols.poll_events() as number;
}
