// use deno_bindgen::deno_bindgen;

use rodio::source::Source;
use rodio::Decoder;
use rodio::OutputStream;
use sdl2::image::LoadSurface;
use sdl2::mouse::Cursor;
use sdl2::pixels::Color;
use sdl2::pixels::PixelFormatEnum;
use sdl2::rect::Point;
use sdl2::rect::Rect;
use sdl2::render::Canvas;
use sdl2::render::TextureAccess;
use sdl2::surface::Surface;
use sdl2::video::DisplayMode;
use sdl2::video::Window;
use sdl2::video::WindowPos;

use std::convert::TryFrom;
use std::fs::File;
use std::io::BufReader;
use std::mem::ManuallyDrop;

use super::fonts::CanvasFontPartial;
use super::tasks::CanvasTask;
use super::{Resource, RESOURCES, TTF_CTX};

pub fn update(task: CanvasTask, canvas: &mut Canvas<Window>) -> bool {
  match task {
    CanvasTask::Quit => return true,
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
      index,
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
            CanvasFontPartial::Shaded { color, background } => partial.shaded(
              Color::RGBA(color.r, color.g, color.b, color.a),
              Color::RGBA(
                background.r,
                background.g,
                background.b,
                background.a,
              ),
            ),
            CanvasFontPartial::Blended { color } => {
              partial.blended(Color::RGBA(color.r, color.g, color.b, color.a))
            }
          };

          resources
            .resources
            .insert(index, Resource::Surface(surface.unwrap()));
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
      window.set_position(WindowPos::Positioned(x), WindowPos::Positioned(y));
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
  false
}
