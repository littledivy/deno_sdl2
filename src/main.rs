use std::io::prelude::*;
use std::net::TcpStream;

use sdl2::event::Event;
use sdl2::image::{InitFlag, LoadSurface};
use sdl2::keyboard::Keycode;
use sdl2::mouse::Cursor;
use sdl2::pixels::Color;
use sdl2::pixels::PixelFormatEnum;
use sdl2::rect::Point;
use sdl2::rect::Rect;
use sdl2::render::CanvasBuilder;
use sdl2::render::WindowCanvas;
use sdl2::surface::Surface;
use sdl2::ttf::Font;
use sdl2::ttf::FontStyle;
use sdl2::video::DisplayMode;
use sdl2::video::Window;
use sdl2::video::WindowBuilder;
use sdl2::video::WindowPos;

use anyhow::anyhow;
use anyhow::Result;

use std::collections::HashMap;
use std::convert::TryFrom;
use std::io::BufReader;

use serde::Deserialize;
use serde::Serialize;

/// https://docs.rs/sdl2/0.34.5/sdl2/video/struct.WindowBuilder.htm
/// Window Builder configuration
#[derive(Deserialize)]
struct WindowOptions {
    title: String,
    height: u32,
    width: u32,
    flags: Option<u32>,
    position: Option<(i32, i32)>,
    centered: bool,
    fullscreen: bool,
    hidden: bool,
    resizable: bool,
    minimized: bool,
    maximized: bool,
}

/// https://rust-sdl2.github.io/rust-sdl2/sdl2/render/struct.CanvasBuilder.html
/// Canvas Builder configuration
#[derive(Deserialize)]
struct CanvasOptions {
    // TODO(@littledivy): Add index() when there is a usecase
    // index: u32,
    software: bool,
}

#[derive(Deserialize)]
struct CanvasPoint {
    x: i32,
    y: i32,
}

#[derive(Deserialize)]
struct Rectangle {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

#[derive(Deserialize)]
struct CanvasColor {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
enum WindowTask {
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

#[derive(Deserialize)]
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
        target: Option<Rectangle>,
        path: String,
        size: u16,
        style: Option<CanvasFontSize>,
    },
    SetCursor {
        path: String,
    },
}

#[derive(Deserialize)]
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

#[derive(Deserialize)]
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

#[derive(Serialize)]
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
            Event::AppWillEnterBackground { .. } => CanvasEvent::AppWillEnterBackground,
            Event::AppDidEnterBackground { .. } => CanvasEvent::AppDidEnterBackground,
            Event::AppWillEnterForeground { .. } => CanvasEvent::AppWillEnterForeground,
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
            _ => CanvasEvent::Unknown,
        }
    }
}

macro_rules! read {
    ($stream: expr) => {{
        let mut length = [0; 4];
        $stream.read(&mut length)?;
        let mut buf = vec![0; u32::from_le_bytes(length) as usize];
        $stream.read(&mut buf)?;
        buf
    }};
}

fn build_canvas(window: Window, options: CanvasOptions) -> WindowCanvas {
    let mut canvas_builder = window.into_canvas();
    if options.software {
        return canvas_builder.software().build().unwrap();
    }

    canvas_builder.build().unwrap()
}

fn build_window(builder: &mut WindowBuilder, options: WindowOptions) -> Window {
    if let Some(flags) = options.flags {
        builder.set_window_flags(flags);
    }
    if let Some(position) = options.position {
        builder.position(position.0, position.1);
    }
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

fn main() -> Result<()> {
    let mut stream = TcpStream::connect("127.0.0.1:34254")?;
    //stream.set_nonblocking(true)?;
    let mut reader = BufReader::new(stream.try_clone()?);
    // let mut fonts: HashMap<u32, Font> = HashMap::new();

    let sdl_context = sdl2::init().map_err(|e| anyhow!(e))?;
    let video_subsystem = sdl_context.video().map_err(|e| anyhow!(e))?;
    let image_context = sdl2::image::init(InitFlag::PNG | InitFlag::JPG).map_err(|e| anyhow!(e))?;
    let mut cursors: Vec<Cursor> = vec![];
    let ttf_context = sdl2::ttf::init()?;

    // Request VIDEO_READY
    stream.write(&[0])?;
    // Get Window options
    let window_options: WindowOptions = serde_json::from_slice(&read!(stream))?;

    let mut window_builder = video_subsystem.window(
        &window_options.title,
        window_options.height,
        window_options.width,
    );
    let window = build_window(&mut window_builder, window_options);
    // TODO: `sdl2::video::Window` method mapping will be useful too

    // Request CANVAS_READY
    stream.write(&[1])?;
    // Get Canvas options
    let canvas_options: CanvasOptions = serde_json::from_slice(&read!(reader))?;

    let mut canvas = build_canvas(window, canvas_options);

    let mut event_pump = sdl_context.event_pump().map_err(|e| anyhow!(e))?;
    'running: loop {
        stream.write(&[1])?;

        let window_tasks: Vec<WindowTask> = serde_json::from_slice(&read!(reader))?;
        for task in window_tasks {
            let window = canvas.window_mut();
            match task {
                WindowTask::SetDisplayMode {
                    width,
                    height,
                    rate,
                    format,
                } => {
                    window
                        .set_display_mode(DisplayMode::new(
                            PixelFormatEnum::try_from(format)
                                .map_err(|_| anyhow!("Invalid pixel format"))?,
                            width,
                            height,
                            rate,
                        ))
                        .map_err(|e| anyhow!(e))?;
                }
                WindowTask::SetTitle { title } => {
                    window.set_title(&title).map_err(|e| anyhow!(e))?;
                }
                WindowTask::SetIcon { icon } => {
                    // TODO: Requires surface creation. Yet to decide the API
                }
                WindowTask::SetPosition { x, y } => {
                    window.set_position(WindowPos::Positioned(x), WindowPos::Positioned(y));
                }
                WindowTask::SetSize { width, height } => {
                    window.set_size(width, height)?;
                }
                WindowTask::SetMinimumSize { width, height } => {
                    window.set_minimum_size(width, height)?;
                }
                WindowTask::Show => {
                    window.show();
                }
                WindowTask::Hide => {
                    window.hide();
                }
                WindowTask::Raise => {
                    window.raise();
                }
                WindowTask::Maximize => {
                    window.maximize();
                }
                WindowTask::Minimize => {
                    window.minimize();
                }
                WindowTask::Restore => {
                    window.restore();
                }
                WindowTask::SetBrightness { brightness } => {
                    window.set_brightness(brightness).map_err(|e| anyhow!(e))?;
                }
                WindowTask::SetOpacity { opacity } => {
                    window.set_opacity(opacity).map_err(|e| anyhow!(e))?;
                }
            }
        }

        // Request CANVAS_LOOP_ACTION
        stream.write(&[2])?;
        // Get canvas task
        let tasks: Vec<CanvasTask> = serde_json::from_slice(&read!(reader))?;
        for task in tasks {
            match task {
                CanvasTask::Quit => {
                    break 'running;
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
                    canvas.set_scale(x, y).map_err(|e| anyhow!(e))?;
                }
                CanvasTask::DrawPoint { x, y } => {
                    canvas
                        .draw_point(Point::new(x, y))
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::DrawPoints { points } => {
                    let points: Vec<Point> = points.iter().map(|p| Point::new(p.x, p.y)).collect();
                    canvas
                        .draw_points(points.as_slice())
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::DrawLine { p1, p2 } => {
                    canvas
                        .draw_line(Point::new(p1.x, p1.y), Point::new(p2.x, p2.y))
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::DrawLines { points } => {
                    let points: Vec<Point> = points.iter().map(|p| Point::new(p.x, p.y)).collect();
                    canvas
                        .draw_lines(points.as_slice())
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::DrawRect {
                    x,
                    y,
                    width,
                    height,
                } => {
                    canvas
                        .draw_rect(Rect::new(x, y, width, height))
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::DrawRects { rects } => {
                    let rects: Vec<Rect> = rects
                        .iter()
                        .map(|r| Rect::new(r.x, r.y, r.width, r.height))
                        .collect();
                    canvas
                        .draw_rects(rects.as_slice())
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::FillRect {
                    x,
                    y,
                    width,
                    height,
                } => {
                    canvas
                        .fill_rect(Some(Rect::new(x, y, width, height)))
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::FillRects { rects } => {
                    let rects: Vec<Rect> = rects
                        .iter()
                        .map(|r| Rect::new(r.x, r.y, r.width, r.height))
                        .collect();
                    canvas
                        .fill_rects(rects.as_slice())
                        .map_err(|e| anyhow!(e))?;
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
                    let texture_creator = canvas.texture_creator();
                    let mut font = ttf_context.load_font(path, size).unwrap();
                    if let Some(font_style) = style {
                        font.set_style(font_style.into());
                    }
                    let partial = font.render(&text);
                    let surface = match options {
                        CanvasFontPartial::Solid { color } => {
                            partial.solid(Color::RGBA(color.r, color.g, color.b, color.a))
                        }
                        CanvasFontPartial::Shaded { color, background } => partial.shaded(
                            Color::RGBA(color.r, color.g, color.b, color.a),
                            Color::RGBA(background.r, background.g, background.b, background.a),
                        ),
                        CanvasFontPartial::Blended { color } => {
                            partial.blended(Color::RGBA(color.r, color.g, color.b, color.a))
                        }
                    };
                    let texture = texture_creator
                        .create_texture_from_surface(&surface.unwrap())
                        .unwrap();
                    let target = match target {
                        Some(r) => Some(Rect::new(r.x, r.y, r.width, r.height)),
                        None => None,
                    };
                    canvas.copy(&texture, None, target).unwrap();
                }
                CanvasTask::SetCursor { path } => {
                    let surface = Surface::from_file(path).map_err(|e| anyhow!(e))?;
                    // TODO(@littledivy): Allow setting hotX and hotY.
                    let cursor = Cursor::from_surface(surface, 0, 0).map_err(|e| anyhow!(e))?;
                    cursor.set();
                    cursors.push(cursor);
                }
                _ => {}
            }
        }

        for event in event_pump.poll_iter() {
            // Send Event ping
            stream.write(&[3])?;
            // Send Event
            let canvas_event: CanvasEvent = event.into();
            let buf = serde_json::to_vec(&canvas_event)?;
            stream.write(&(buf.len() as u32).to_le_bytes())?;
            stream.write(&buf)?;
        }
    }

    Ok(())
}
