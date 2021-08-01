use std::io::prelude::*;
use std::net::TcpStream;

use sdl2::event::Event;
use sdl2::keyboard::Keycode;
use sdl2::pixels::Color;
use sdl2::render::CanvasBuilder;
use sdl2::render::WindowCanvas;
use sdl2::video::Window;
use sdl2::video::WindowBuilder;

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

#[derive(Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
enum CanvasTask {
    Present,
    SetDrawColor { r: u8, g: u8, b: u8, a: u8 },
    // TODO(@littledivy): Add this when there is a usecase
    // SetBlendMode { },
    Clear,
    Quit,
    None,
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
        $stream.read_exact(&mut length)?;
        let mut buf = vec![0; u32::from_le_bytes(length) as usize];
        $stream.read_exact(&mut buf)?;
        buf
    }};
}

fn build_canvas(window: Window, options: CanvasOptions) -> WindowCanvas {
    let builder = window.into_canvas();

    if options.software {
        return builder.software().build().unwrap();
    }

    builder.build().unwrap()
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

    builder.build().unwrap()
}

fn canvas_task(canvas: &mut WindowCanvas, task: CanvasTask) {
    match task {
        CanvasTask::Present => {
            canvas.present();
        }
        CanvasTask::Clear => {
            canvas.clear();
        }
        CanvasTask::SetDrawColor { r, g, b, a } => {
            canvas.set_draw_color((r, g, b, a));
        }
        _ => {}
    }
}

fn main() -> std::io::Result<()> {
    let mut stream = TcpStream::connect("127.0.0.1:34254")?;

    let sdl_context = sdl2::init().unwrap();
    let video_subsystem = sdl_context.video().unwrap();
    // Request VIDEO_READY
    stream.write(&[0])?;
    // Get Window options
    let window_options: WindowOptions = serde_json::from_slice(&read!(stream)).unwrap();

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
    let canvas_options: CanvasOptions = serde_json::from_slice(&read!(stream)).unwrap();
    let mut canvas = build_canvas(window, canvas_options);

    let mut event_pump = sdl_context.event_pump().unwrap();
    'running: loop {
        for event in event_pump.poll_iter() {
            // Send Event ping
            stream.write(&[3])?;
            // Send Event
            let canvas_event: CanvasEvent = event.into();
            let buf = serde_json::to_vec(&canvas_event).unwrap();
            stream.write(&(buf.len() as u32).to_le_bytes())?;
            stream.write(&buf)?;
        }
        // Request CANVAS_LOOP_ACTION
        stream.write(&[2])?;
        // Get canvas task
        let tasks: Vec<CanvasTask> = serde_json::from_slice(&read!(stream)).unwrap();
        for task in tasks {
            if task == CanvasTask::Quit {
                break 'running;
            }
            canvas_task(&mut canvas, task);
        }

        stream.read_exact(&mut vec![0; 1])?;
    }

    Ok(())
}
