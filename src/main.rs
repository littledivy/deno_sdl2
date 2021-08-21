use std::io::prelude::*;
use std::net::TcpStream;

use sdl2::audio::AudioCallback;
use sdl2::audio::AudioDevice;
use sdl2::audio::AudioSpecDesired;
use sdl2::event::Event;
use sdl2::image::{InitFlag, LoadSurface};
use sdl2::keyboard::Keycode;
use sdl2::mixer::InitFlag as MixerInitFlag;
use sdl2::mixer::AUDIO_S16LSB;
use sdl2::mixer::DEFAULT_CHANNELS;
use sdl2::mouse::Cursor;
use sdl2::pixels::Color;
use sdl2::pixels::PixelFormatEnum;
use sdl2::rect::Point;
use sdl2::rect::Rect;
use sdl2::render::CanvasBuilder;
use sdl2::render::Texture;
use sdl2::render::TextureAccess;
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
use std::mem::ManuallyDrop;

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
        // Internal
        index: u32,
        path: String,
    },
    // CreateAudioDevice {
    //     freq: Option<i32>,
    //     channels: Option<u8>,
    //     samples: Option<u16>,
    // },
    OpenAudio {
        frequency: i32,
        // Maps to formats defined in sdl2::mixer
        format: u16,
        channels: i32,
        chunksize: i32,
    },
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

// struct AudioManager(TcpStream);

// impl AudioCallback for AudioManager {
//     type Channel = f32;

//     fn callback(&mut self, buf: &mut [f32]) {
//         let mut magic = [0; 2];
//         self.0.write(&[5]);
//          self.0.peek(&mut magic);
//          if(magic[0] == 0) {
//              println!("inside");
//          self.0.read(&mut [0; 2]);
//             self.0.write(&[5]); // AUDIO_CALLBACK
//             self.0.write(&buf.len().to_le_bytes());

//             let mut length = [0; 4];
//             self.0.read(&mut length).unwrap();

//             let mut recv = vec![0; u32::from_le_bytes(length) as usize];
//             self.0.read(&mut recv).unwrap();

//             let recv: Vec<f32> = serde_json::from_slice(&recv).unwrap();
//             for (i, b) in buf.into_iter().enumerate() {
//                 *b = recv[i];
//             }
//         } else {
//             println!("skipped");
//         }
//     }
// }

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

enum Resource<'a> {
    Cursor(Cursor),
    Surface(Surface<'a>),
    Texture(Texture<'a>),
}

fn main() -> Result<()> {
    let mut stream = TcpStream::connect("0.0.0.0:34254")?;
    let mut reader = BufReader::new(stream.try_clone()?);

    let sdl_context = sdl2::init().map_err(|e| anyhow!(e))?;
    let video_subsystem = sdl_context.video().map_err(|e| anyhow!(e))?;
    let image_context = sdl2::image::init(InitFlag::PNG | InitFlag::JPG).map_err(|e| anyhow!(e))?;
    let mixer_context = sdl2::mixer::init(MixerInitFlag::MP3).map_err(|e| anyhow!(e))?;

    let ttf_context = sdl2::ttf::init()?;
    // let audio_subsystem = sdl_context.audio().map_err(|e| anyhow!(e))?;
    // let mut audio_devices: Vec<AudioDevice<AudioManager>> = vec![];

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
    let texture_creator = canvas.texture_creator();
    let mut event_pump = sdl_context.event_pump().map_err(|e| anyhow!(e))?;

    let mut resources: HashMap<u32, Resource> = HashMap::new();

    stream.set_nodelay(true)?;
    'running: loop {
        let events: Vec<CanvasEvent> = event_pump.poll_iter().map(|e| e.into()).collect();
        if events.len() > 0 {
            stream.write(&[2])?;
            let buf = serde_json::to_vec(&events)?;
            stream.write(&(buf.len() as u32).to_le_bytes())?;
            stream.write(&buf)?;
        }

        // Request CANVAS_LOOP_ACTION
        stream.write(&[1])?;
        // Get canvas task
        let tasks: Vec<CanvasTask> = serde_json::from_slice(&read!(reader))?;
        for task in tasks {
            let window = canvas.window_mut();
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
                CanvasTask::SetCursor { path, index } => {
                    let surface = Surface::from_file(path).map_err(|e| anyhow!(e))?;
                    // TODO(@littledivy): Allow setting hotX and hotY.
                    let cursor = Cursor::from_surface(surface, 0, 0).map_err(|e| anyhow!(e))?;
                    cursor.set();

                    resources.insert(index, Resource::Cursor(cursor));
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
                CanvasTask::OpenAudio {
                    frequency,
                    format,
                    channels,
                    chunksize,
                } => {
                    // Praise God! Finally don't have to deal to destructors here :D
                    sdl2::mixer::open_audio(frequency, format, channels, chunksize)
                        .map_err(|e| anyhow!(e))?;
                }
                CanvasTask::PlayMusic { path } => {
                    let music = ManuallyDrop::new(
                        sdl2::mixer::Music::from_file(path).map_err(|e| anyhow!(e))?,
                    );
                    music.play(1);
                }
                CanvasTask::CreateSurface {
                    width,
                    height,
                    format,
                    index,
                } => {
                    let surface = Surface::new(
                        width,
                        height,
                        PixelFormatEnum::try_from(format)
                            .map_err(|_| anyhow!("Invalid pixel format"))?,
                    )
                    .map_err(|e| anyhow!(e))?;
                    resources.insert(index, Resource::Surface(surface));
                }
                CanvasTask::CreateSurfaceBitmap { path, index } => {
                    let surface = Surface::load_bmp(&path).map_err(|e| anyhow!(e))?;
                    resources.insert(index, Resource::Surface(surface));
                }
                CanvasTask::CreateTexture {
                    format,
                    access,
                    width,
                    height,
                    index,
                } => {
                    let format: Option<PixelFormatEnum> = format.and_then(|f| {
                        Some(
                            PixelFormatEnum::try_from(f)
                                .map_err(|_| anyhow!("Invalid pixel format"))
                                .unwrap(),
                        )
                    });
                    let texture = texture_creator.create_texture(
                        format,
                        TextureAccess::try_from(access)
                            .map_err(|_| anyhow!("Invalid texture access"))?,
                        width,
                        height,
                    )?;
                    resources.insert(index, Resource::Texture(texture));
                }
                CanvasTask::CreateTextureSurface { surface, index } => {
                    if let Some(surface) = resources.get(&surface) {
                        match surface {
                            Resource::Surface(surface) => {
                                let texture =
                                    texture_creator.create_texture_from_surface(surface)?;
                                resources.insert(index, Resource::Texture(texture));
                            }
                            _ => {}
                        }
                    }
                }
                CanvasTask::CopyRect {
                    texture,
                    rect1,
                    rect2,
                } => {
                    if let Some(texture) = resources.get(&texture) {
                        match texture {
                            Resource::Texture(texture) => {
                                let rect1 = Rect::new(rect1.x, rect1.y, rect1.width, rect1.height);
                                let rect2 = Rect::new(rect2.x, rect2.y, rect2.width, rect2.height);
                                canvas.copy(texture, rect1, rect2).map_err(|e| anyhow!(e))?;
                            }
                            _ => {}
                        }
                    }
                }
                CanvasTask::SetDisplayMode {
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
                CanvasTask::SetTitle { title } => {
                    window.set_title(&title).map_err(|e| anyhow!(e))?;
                }
                CanvasTask::SetIcon { icon } => {
                    // TODO: Requires surface creation. Yet to decide the API
                }
                CanvasTask::SetPosition { x, y } => {
                    window.set_position(WindowPos::Positioned(x), WindowPos::Positioned(y));
                }
                CanvasTask::SetSize { width, height } => {
                    window.set_size(width, height)?;
                }
                CanvasTask::SetMinimumSize { width, height } => {
                    window.set_minimum_size(width, height)?;
                }
                CanvasTask::Show => {
                    window.show();
                }
                CanvasTask::Hide => {
                    window.hide();
                }
                CanvasTask::Raise => {
                    window.raise();
                }
                CanvasTask::Maximize => {
                    window.maximize();
                }
                CanvasTask::Minimize => {
                    window.minimize();
                }
                CanvasTask::Restore => {
                    window.restore();
                }
                CanvasTask::SetBrightness { brightness } => {
                    window.set_brightness(brightness).map_err(|e| anyhow!(e))?;
                }
                CanvasTask::SetOpacity { opacity } => {
                    window.set_opacity(opacity).map_err(|e| anyhow!(e))?;
                }
                _ => {}
            }
        }
    }

    Ok(())
}
