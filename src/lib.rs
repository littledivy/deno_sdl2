mod events;
mod fonts;
mod shapes;
mod tasks;
mod update;

use deno_bindgen::deno_bindgen;

use sdl2::image::InitFlag;
use sdl2::mouse::Cursor;
use sdl2::render::Texture;
use sdl2::render::WindowCanvas;
use sdl2::surface::Surface;
use sdl2::video::Window;
use sdl2::video::WindowBuilder;

use events::CanvasEvent;
use tasks::CanvasTask;
use update::update;

use std::cell::RefCell;
use std::collections::HashMap;

/// https://docs.rs/sdl2/0.34.5/sdl2/video/struct.WindowBuilder.htm
/// Window Builder configuration
#[deno_bindgen]
struct WindowOptions {
  title: String,
  height: u32,
  width: u32,
  flags: Option<u32>,
  //position: Option<(i32, i32)>,
  centered: bool,
  fullscreen: bool,
  hidden: bool,
  resizable: bool,
  minimized: bool,
  maximized: bool,
}

/// https://rust-sdl2.github.io/rust-sdl2/sdl2/render/struct.CanvasBuilder.html
/// Canvas Builder configuration
#[deno_bindgen]
struct CanvasOptions {
  // TODO(@littledivy): Add index() when there is a usecase
  // index: u32,
  software: bool,
}

enum Resource {
  Cursor(Cursor),
  Surface(Surface<'static>),
  Texture(Texture),
}

#[derive(Default)]
struct LocalStore {
  resources: HashMap<u32, Resource>,
  texture_creator:
    Option<sdl2::render::TextureCreator<sdl2::video::WindowContext>>,
}

thread_local! {
  static WINDOW: RefCell<Option<WindowCanvas>> = RefCell::new(None);
  static TTF_CTX: RefCell<Option<sdl2::ttf::Sdl2TtfContext>> = RefCell::new(None);
  static RESOURCES: RefCell<LocalStore> = RefCell::new(LocalStore::default());
  static EVENT_BUF: RefCell<Vec<u8>> = RefCell::new(vec![]);
  static EVENTLOOP: RefCell<Option<sdl2::EventPump>> = RefCell::new(None);
}

fn build_window(builder: &mut WindowBuilder, options: WindowOptions) -> Window {
  if let Some(flags) = options.flags {
    builder.set_window_flags(flags);
  }
  //if let Some(position) = options.position {
  //   builder.position(position.0, position.1);
  //}
  if options.centered {
    builder.position_centered();
  }
  if options.fullscreen {
    builder.fullscreen();
  }
  if options.hidden {
    builder.hidden();
  }
  if options.minimized {
    builder.minimized();
  }
  if options.maximized {
    builder.maximized();
  }
  if options.resizable {
    builder.resizable();
  }
  builder.build().unwrap()
}

fn build_canvas(window: Window, options: CanvasOptions) -> WindowCanvas {
  let canvas_builder = window.into_canvas();
  if options.software {
    return canvas_builder.software().build().unwrap();
  }
  canvas_builder.build().unwrap()
}

#[deno_bindgen]
pub fn init(options: WindowOptions, canvas_options: CanvasOptions) {
  let sdl_context = sdl2::init().unwrap();
  let video_subsystem = sdl_context.video().unwrap();
  let _image_context =
    sdl2::image::init(InitFlag::PNG | InitFlag::JPG).unwrap();
  let ttf_context = sdl2::ttf::init().unwrap();

  let mut window_builder =
    video_subsystem.window(&options.title, options.width, options.height);

  let window = build_window(&mut window_builder, options);
  let canvas = build_canvas(window, canvas_options);

  let texture_creator = canvas.texture_creator();
  RESOURCES.with(|cell| {
    cell.borrow_mut().texture_creator = Some(texture_creator);
  });
  WINDOW.with(|cell| {
    *cell.borrow_mut() = Some(canvas);
  });

  let event_pump = sdl_context.event_pump().unwrap();
  EVENTLOOP.with(|cell| {
    *cell.borrow_mut() = Some(event_pump);
  });

  TTF_CTX.with(|cell| {
    *cell.borrow_mut() = Some(ttf_context);
  });
}

#[deno_bindgen]
pub fn poll_events() -> usize {
  EVENTLOOP.with(|cell| {
    if let Some(ref mut event_pump) = *cell.borrow_mut() {
      let events: Vec<CanvasEvent> =
        event_pump.poll_iter().map(|e| e.into()).collect();
      let buf = deno_bindgen::serde_json::to_vec(&events).unwrap();
      EVENT_BUF.with(|cell| {
        let len = buf.len();
        *cell.borrow_mut() = buf;
        len
      })
    } else {
      0
    }
  })
}

#[deno_bindgen]
pub fn fill_events(buf: &mut [u8]) {
  EVENT_BUF.with(|cell| {
    let mut event_buf = cell.borrow_mut();
    buf.swap_with_slice(&mut *event_buf);
    *event_buf = vec![];
  });
}

macro_rules! query_texture_fn {
  ($name: ident, $attr: ident) => {
    #[deno_bindgen]
    pub fn $name(texture: u32) -> i32 {
      RESOURCES.with(|cell| {
        let resources = cell.borrow();
        if let Some(Resource::Texture(texture)) =
          resources.resources.get(&texture)
        {
          let query = texture.query();
          query.$attr as i32
        } else {
          0
        }
      })
    }
  };
}

query_texture_fn!(query_texture_height, height);
query_texture_fn!(query_texture_width, width);
query_texture_fn!(query_texture_access, access);
query_texture_fn!(query_texture_format, format);

#[deno_bindgen]
pub fn do_task(task: CanvasTask) {
  let mut should_quit = false;
  WINDOW.with(|cell| {
    if let Some(ref mut canvas) = *cell.borrow_mut() {
      should_quit = update(task, canvas)
    }

    if should_quit {
      let mut cell = cell.borrow_mut();
      *cell = None;
      drop(cell);
      EVENTLOOP.with(|cell| *cell.borrow_mut() = None);
      return;
    }
  });
}

//TODO: deno_bindgen doesnt support slices so yea
#[deno_bindgen]
pub fn update_texture(
  // rect: Option<Rectangle>,
  pixel_data: &[u8],
  pitch: usize,
  index: u32,
) {
  RESOURCES.with(|rcell| {
    let mut resources = rcell.borrow_mut();
    if let Some(Resource::Texture(texture)) =
      resources.resources.get_mut(&index)
    {
      texture.update(None, pixel_data, pitch).ok();
    };
  });
}

#[deno_bindgen]
pub fn query_window_width() -> u32 {
  WINDOW.with(|cell| {
    if let Some(ref mut canvas) = *cell.borrow_mut() {
      let (width, _) = canvas.window().size();
      return width;
    }
    0
  });
  0
}

#[deno_bindgen]
pub fn query_window_height() -> u32 {
  WINDOW.with(|cell| {
    if let Some(ref mut canvas) = *cell.borrow_mut() {
      let (_, height) = canvas.window().size();
      return height;
    }
    0
  });
  0
}
