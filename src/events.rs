use deno_bindgen::deno_bindgen;

use sdl2::event::Event;
use sdl2::event::WindowEvent;

#[deno_bindgen]
#[serde(rename_all = "snake_case")]
pub enum CanvasEvent {
  Quit,
  AppTerminating,
  AppLowMemory,
  AppWillEnterBackground,
  AppDidEnterBackground,
  AppWillEnterForeground,
  Resized {
    width: i32,
    height: i32,
  },
  KeyUp {
    keycode: Option<i32>,
    scancode: Option<i32>,
    r#mod: u16,
    repeat: bool,
  },
  KeyDown {
    keycode: Option<i32>,
    scancode: Option<i32>,
    r#mod: u16,
    repeat: bool,
  },
  MouseMotion {
    which: u32,
    x: i32,
    y: i32,
    xrel: i32,
    yrel: i32,
    state: u32,
  },
  MouseButtonUp {
    x: i32,
    y: i32,
    clicks: u8,
    which: u32,
    button: u8,
  },
  MouseButtonDown {
    x: i32,
    y: i32,
    clicks: u8,
    which: u32,
    button: u8,
  },
  MouseWheel {
    x: i32,
    y: i32,
    which: u32,
    direction: u32,
  },
  Unknown,
}

impl Into<CanvasEvent> for Event {
  fn into(self) -> CanvasEvent {
    match self {
      Event::Quit { .. } => CanvasEvent::Quit,
      Event::AppTerminating { .. } => CanvasEvent::AppTerminating,
      Event::AppLowMemory { .. } => CanvasEvent::AppLowMemory,
      Event::AppWillEnterBackground { .. } => {
        CanvasEvent::AppWillEnterBackground
      }
      Event::AppDidEnterBackground { .. } => CanvasEvent::AppDidEnterBackground,
      Event::AppWillEnterForeground { .. } => {
        CanvasEvent::AppWillEnterForeground
      }
      Event::KeyUp {
        keycode,
        scancode,
        repeat,
        keymod,
        ..
      } => CanvasEvent::KeyUp {
        repeat,
        r#mod: keymod.bits(),
        keycode: keycode.map(|k| k as i32),
        scancode: scancode.map(|s| s as i32),
      },
      Event::KeyDown {
        keycode,
        scancode,
        repeat,
        keymod,
        ..
      } => CanvasEvent::KeyDown {
        repeat,
        r#mod: keymod.bits(),
        keycode: keycode.map(|k| k as i32),
        scancode: scancode.map(|s| s as i32),
      },
      Event::MouseMotion {
        which,
        mousestate,
        x,
        y,
        xrel,
        yrel,
        ..
      } => CanvasEvent::MouseMotion {
        which,
        x,
        y,
        xrel,
        yrel,
        state: mousestate.to_sdl_state(),
      },
      Event::MouseButtonDown {
        x,
        y,
        clicks,
        which,
        mouse_btn,
        ..
      } => CanvasEvent::MouseButtonDown {
        x,
        y,
        clicks,
        which,
        button: mouse_btn as u8,
      },
      Event::MouseButtonUp {
        x,
        y,
        clicks,
        which,
        mouse_btn,
        ..
      } => CanvasEvent::MouseButtonUp {
        x,
        y,
        clicks,
        which,
        button: mouse_btn as u8,
      },
      Event::Window { win_event, .. } => match win_event {
        WindowEvent::Resized(width, height) => {
          CanvasEvent::Resized { width, height }
        }
        _ => CanvasEvent::Unknown,
      },
      _ => CanvasEvent::Unknown,
    }
  }
}
