use deno_bindgen::deno_bindgen;

use rodio::source::Source;
use rodio::Decoder;
use rodio::OutputStream;
use sdl2::audio::AudioCallback;
use sdl2::audio::AudioDevice;
use sdl2::audio::AudioSpecDesired;
use sdl2::event::Event;
use sdl2::image::{InitFlag, LoadSurface};
use sdl2::keyboard::Keycode;
use sdl2::mouse::Cursor;
use sdl2::pixels::Color;
use sdl2::pixels::PixelFormatEnum;
use sdl2::rect::Point;
use sdl2::rect::Rect;
use sdl2::render::CanvasBuilder;
use sdl2::render::Texture;
use sdl2::render::TextureAccess;
use sdl2::render::TextureQuery;
use sdl2::render::WindowCanvas;
use sdl2::surface::Surface;
use sdl2::ttf::Font;
use sdl2::ttf::FontStyle;
use sdl2::video::DisplayMode;
use sdl2::video::Window;
use sdl2::video::WindowBuilder;
use sdl2::video::WindowPos;

use std::convert::TryFrom;
use std::fs::File;
use std::io::BufReader;
use std::mem::ManuallyDrop;
use std::sync::Mutex;

use serde::Serialize;

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

#[deno_bindgen]
struct CanvasPoint {
  x: i32,
  y: i32,
}

#[deno_bindgen]
struct Rectangle {
  x: i32,
  y: i32,
  width: u32,
  height: u32,
}

#[deno_bindgen]
struct OptionRectangle {
  x: i32,
  y: i32,
  width: Option<u32>,
  height: Option<u32>,
}

#[deno_bindgen]
struct CanvasColor {
  r: u8,
  g: u8,
  b: u8,
  a: u8,
}

#[deno_bindgen]
#[serde(rename_all = "camelCase")]
enum CanvasTask {
  Present,
  SetDrawColor {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
  },
  // TODO(@littledivy): Add this when there is a usecase
  // SetBlendMode { },
  SetScale {
    x: f32,
    y: f32,
  },
  DrawPoint {
    x: i32,
    y: i32,
  },
  DrawPoints {
    points: Vec<CanvasPoint>,
  },
  DrawLine {
    p1: CanvasPoint,
    p2: CanvasPoint,
  },
  DrawLines {
    points: Vec<CanvasPoint>,
  },
  DrawRect {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
  },
  DrawRects {
    rects: Vec<Rectangle>,
  },
  FillRect {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
  },
  FillRects {
    rects: Vec<Rectangle>,
  },
  Clear,
  Quit,
  None,
  // LoadFont {
  //     // Internal
  //     index: u32,
  //     path: String,
  //     size: u16,
  //     style: Option<CanvasFontSize>,
  // },
  RenderFont {
    text: String,
    options: CanvasFontPartial,
    target: Option<OptionRectangle>,
    path: String,
    size: u16,
    style: Option<CanvasFontSize>,
  },
  SetCursor {
    // Internal
    index: u32,
    path: String,
  },
  // CreateAudioDevice {
  //     freq: Option<i32>,
  //     channels: Option<u8>,
  //     samples: Option<u16>,
  // },
  PlayMusic {
    path: String,
  },
  CreateSurface {
    width: u32,
    height: u32,
    // PixelFormatEnum
    format: u32,
    index: u32,
  },
  CreateSurfaceBitmap {
    path: String,
    index: u32,
  },
  LoadSurface {
    path: String,
    index: u32,
  },
  CreateTexture {
    // PixelFormatEnum
    format: Option<u32>,
    // TextureAccess
    access: u32,
    width: u32,
    height: u32,
    index: u32,
  },
  CreateTextureSurface {
    // Internal indexs
    surface: u32,
    index: u32,
  },
  LoadTexture {
    path: String,
    index: u32,
  },
  CopyRect {
    texture: u32,
    rect1: Rectangle,
    rect2: Rectangle,
  },
  // format is i32 representation of `sdl2::pixels::PixelFormatEnum`
  SetDisplayMode {
    width: i32,
    height: i32,
    rate: i32,
    format: u32,
  },
  SetTitle {
    title: String,
  },
  // Path to icon file. Surface is created under the hood
  SetIcon {
    icon: String,
  },
  // x and y should be `sdl2::video::WindowPos`
  SetPosition {
    x: i32,
    y: i32,
  },
  SetSize {
    width: u32,
    height: u32,
  },
  SetMinimumSize {
    width: u32,
    height: u32,
  },
  Show,
  Hide,
  Raise,
  Maximize,
  Minimize,
  Restore,
  SetBrightness {
    brightness: f64,
  },
  SetOpacity {
    opacity: f32,
  },
}

#[deno_bindgen]
#[serde(rename_all = "lowercase")]
enum CanvasFontPartial {
  Solid {
    color: CanvasColor,
  },
  Shaded {
    color: CanvasColor,
    background: CanvasColor,
  },
  Blended {
    color: CanvasColor,
  },
}

#[deno_bindgen]
#[serde(rename_all = "lowercase")]
enum CanvasFontSize {
  Normal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
}

impl Into<FontStyle> for CanvasFontSize {
  fn into(self) -> FontStyle {
    match self {
      CanvasFontSize::Normal => FontStyle::NORMAL,
      CanvasFontSize::Bold => FontStyle::BOLD,
      CanvasFontSize::Italic => FontStyle::ITALIC,
      CanvasFontSize::Underline => FontStyle::UNDERLINE,
      CanvasFontSize::Strikethrough => FontStyle::STRIKETHROUGH,
    }
  }
}

use std::cell::RefCell;
use std::collections::HashMap;

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
  let mut canvas_builder = window.into_canvas();
  if options.software {
    return canvas_builder.software().build().unwrap();
  }
  canvas_builder.build().unwrap()
}

#[deno_bindgen]
pub fn init(options: WindowOptions, canvas_options: CanvasOptions) {
  let sdl_context = sdl2::init().unwrap();
  let video_subsystem = sdl_context.video().unwrap();
  let image_context = sdl2::image::init(InitFlag::PNG | InitFlag::JPG).unwrap();
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
#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
enum CanvasEvent {
  Quit,
  AppTerminating,
  AppLowMemory,
  AppWillEnterBackground,
  AppDidEnterBackground,
  AppWillEnterForeground,
  // Window { window_event: CanvasWindowEvent }
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
      _ => CanvasEvent::Unknown,
    }
  }
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

#[deno_bindgen]
pub fn do_task(task: CanvasTask) {
  let mut should_quit = false;
  WINDOW.with(|cell| {
    if let Some(ref mut canvas) = *cell.borrow_mut() {
      match task {
        CanvasTask::Quit => {
          should_quit = true;
        }
        CanvasTask::Present => {
          canvas.present();
        }
        CanvasTask::Clear => {
          canvas.clear();
        }
        CanvasTask::SetDrawColor { r, g, b, a } => {
          canvas.set_draw_color((r, g, b, a));
        }
        CanvasTask::SetScale { x, y } => {
          canvas.set_scale(x, y).unwrap();
        }
        CanvasTask::DrawPoint { x, y } => {
          canvas.draw_point(Point::new(x, y)).unwrap();
        }
        CanvasTask::DrawPoints { points } => {
          let points: Vec<Point> =
            points.iter().map(|p| Point::new(p.x, p.y)).collect();
          canvas.draw_points(points.as_slice()).unwrap();
        }
        CanvasTask::DrawLine { p1, p2 } => {
          canvas
            .draw_line(Point::new(p1.x, p1.y), Point::new(p2.x, p2.y))
            .unwrap();
        }
        CanvasTask::DrawLines { points } => {
          let points: Vec<Point> =
            points.iter().map(|p| Point::new(p.x, p.y)).collect();
          canvas.draw_lines(points.as_slice()).unwrap();
        }
        CanvasTask::DrawRect {
          x,
          y,
          width,
          height,
        } => {
          canvas.draw_rect(Rect::new(x, y, width, height)).unwrap();
        }
        CanvasTask::DrawRects { rects } => {
          let rects: Vec<Rect> = rects
            .iter()
            .map(|r| Rect::new(r.x, r.y, r.width, r.height))
            .collect();
          canvas.draw_rects(rects.as_slice()).unwrap();
        }
        CanvasTask::FillRect {
          x,
          y,
          width,
          height,
        } => {
          canvas
            .fill_rect(Some(Rect::new(x, y, width, height)))
            .unwrap();
        }
        CanvasTask::FillRects { rects } => {
          let rects: Vec<Rect> = rects
            .iter()
            .map(|r| Rect::new(r.x, r.y, r.width, r.height))
            .collect();
          canvas.fill_rects(rects.as_slice()).unwrap();
        }
        // CanvasTask::LoadFont { path, size, style, index } => {
        //     let mut font = ttf_context.load_font(path, size).unwrap();
        //     if let Some(font_style) = style {
        //         font.set_style(font_style.into());
        //     }
        //     fonts.insert(index, font);
        // }
        CanvasTask::RenderFont {
          path,
          size,
          style,
          text,
          options,
          target,
        } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();

            TTF_CTX.with(|cell| {
              let ttf_context = cell.borrow_mut();
              let mut font =
                ttf_context.as_ref().unwrap().load_font(path, size).unwrap();
              if let Some(font_style) = style {
                font.set_style(font_style.into());
              }
              let partial = font.render(&text);
              let surface = match options {
                CanvasFontPartial::Solid { color } => {
                  partial.solid(Color::RGBA(color.r, color.g, color.b, color.a))
                }
                CanvasFontPartial::Shaded { color, background } => partial
                  .shaded(
                    Color::RGBA(color.r, color.g, color.b, color.a),
                    Color::RGBA(
                      background.r,
                      background.g,
                      background.b,
                      background.a,
                    ),
                  ),
                CanvasFontPartial::Blended { color } => partial
                  .blended(Color::RGBA(color.r, color.g, color.b, color.a)),
              };
              let texture = resources
                .texture_creator
                .as_ref()
                .unwrap()
                .create_texture_from_surface(&surface.unwrap())
                .unwrap();
              let target = match target {
                Some(r) => {
                  let (width, height) = match (r.width, r.height) {
                    (None, None) => {
                      let TextureQuery { width, height, .. } = texture.query();
                      (width, height)
                    }
                    (Some(width), None) => {
                      let TextureQuery { height, .. } = texture.query();
                      (width, height)
                    }
                    (None, Some(height)) => {
                      let TextureQuery { width, .. } = texture.query();
                      (width, height)
                    }
                    (Some(width), Some(height)) => (width, height),
                  };
                  Some(Rect::new(r.x, r.y, width, height))
                }
                None => None,
              };
              canvas.copy(&texture, None, target).unwrap();
            });
          });
        }
        CanvasTask::SetCursor { path, index } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();
            let surface = Surface::from_file(path).unwrap();
            // TODO(@littledivy): Allow setting hotX and hotY.
            let cursor = Cursor::from_surface(surface, 0, 0).unwrap();
            cursor.set();

            resources.resources.insert(index, Resource::Cursor(cursor));
          });
        }
        // TODO(@littledivy): Revisit this when we find a way to distinguish responses
        // CanvasTask::CreateAudioDevice { freq, channels, samples } => {
        //     let desired_spec = AudioSpecDesired {
        //         freq,
        //         channels,
        //         samples,
        //     };
        //     let mut audio_stream = stream.try_clone().unwrap();
        //     let device = audio_subsystem.open_playback(None, &desired_spec, |spec| {
        //         AudioManager(audio_stream)
        //     }).unwrap();
        //     device.resume();
        //     audio_devices.push(device);
        // }
        CanvasTask::PlayMusic { path } => {
          let (_stream, stream_handle) = OutputStream::try_default().unwrap();
          let _stream = ManuallyDrop::new(_stream);
          let stream_handle = ManuallyDrop::new(stream_handle);
          let decoder =
            Decoder::new(BufReader::new(File::open(path).unwrap())).unwrap();
          stream_handle.play_raw(decoder.convert_samples()).unwrap();
        }
        CanvasTask::CreateSurface {
          width,
          height,
          format,
          index,
        } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();
            let surface = Surface::new(
              width,
              height,
              PixelFormatEnum::try_from(format).unwrap(),
            )
            .unwrap();
            resources
              .resources
              .insert(index, Resource::Surface(surface));
          });
        }
        CanvasTask::CreateSurfaceBitmap { path, index } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();
            let surface = Surface::load_bmp(&path).unwrap();
            resources
              .resources
              .insert(index, Resource::Surface(surface));
          });
        }
        CanvasTask::CreateTexture {
          format,
          access,
          width,
          height,
          index,
        } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();

            let format: Option<PixelFormatEnum> =
              format.and_then(|f| Some(PixelFormatEnum::try_from(f).unwrap()));

            let texture = resources
              .texture_creator
              .as_ref()
              .unwrap()
              .create_texture(
                format,
                TextureAccess::try_from(access).unwrap(),
                width,
                height,
              )
              .unwrap();
            (*resources)
              .resources
              .insert(index, Resource::Texture(texture));
          });
        }
        CanvasTask::CreateTextureSurface { surface, index } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();
            if let Some(surface) = resources.resources.get(&surface) {
              match surface {
                Resource::Surface(surface) => {
                  let texture = resources
                    .texture_creator
                    .as_ref()
                    .unwrap()
                    .create_texture_from_surface(surface)
                    .unwrap();
                  (*resources)
                    .resources
                    .insert(index, Resource::Texture(texture));
                }
                _ => {}
              }
            }
          });
        }
        CanvasTask::LoadSurface { path, index } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();
            let surface = Surface::from_file(&path).unwrap();
            resources
              .resources
              .insert(index, Resource::Surface(surface));
          });
        }
        CanvasTask::CopyRect {
          texture,
          rect1,
          rect2,
        } => {
          RESOURCES.with(|rcell| {
            let mut resources = rcell.borrow_mut();
            if let Some(texture) = resources.resources.get(&texture) {
              match texture {
                Resource::Texture(texture) => {
                  let rect1 =
                    Rect::new(rect1.x, rect1.y, rect1.width, rect1.height);
                  let rect2 =
                    Rect::new(rect2.x, rect2.y, rect2.width, rect2.height);
                  canvas.copy(&texture, rect1, rect2).unwrap();
                }
                _ => {}
              }
            }
          });
        }
        CanvasTask::SetDisplayMode {
          width,
          height,
          rate,
          format,
        } => {
          let window = canvas.window_mut();
          window
            .set_display_mode(DisplayMode::new(
              PixelFormatEnum::try_from(format).unwrap(),
              width,
              height,
              rate,
            ))
            .unwrap();
        }
        CanvasTask::SetTitle { title } => {
          let window = canvas.window_mut();
          window.set_title(&title).unwrap();
        }
        CanvasTask::SetIcon { icon } => {
          // TODO: Requires surface creation. Yet to decide the API
        }
        CanvasTask::SetPosition { x, y } => {
          let window = canvas.window_mut();
          window
            .set_position(WindowPos::Positioned(x), WindowPos::Positioned(y));
        }
        CanvasTask::SetSize { width, height } => {
          let window = canvas.window_mut();
          window.set_size(width, height).unwrap();
        }
        CanvasTask::SetMinimumSize { width, height } => {
          let window = canvas.window_mut();
          window.set_minimum_size(width, height).unwrap();
        }
        CanvasTask::Show => {
          let window = canvas.window_mut();
          window.show();
        }
        CanvasTask::Hide => {
          let window = canvas.window_mut();
          window.hide();
        }
        CanvasTask::Raise => {
          let window = canvas.window_mut();
          window.raise();
        }
        CanvasTask::Maximize => {
          let window = canvas.window_mut();
          window.maximize();
        }
        CanvasTask::Minimize => {
          let window = canvas.window_mut();
          window.minimize();
        }
        CanvasTask::Restore => {
          let window = canvas.window_mut();
          window.restore();
        }
        CanvasTask::SetBrightness { brightness } => {
          let window = canvas.window_mut();
          window.set_brightness(brightness).unwrap();
        }
        CanvasTask::SetOpacity { opacity } => {
          let window = canvas.window_mut();
          window.set_opacity(opacity).unwrap();
        }
        _ => {}
      }
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
