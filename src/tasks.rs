use deno_bindgen::deno_bindgen;

use super::shapes::{CanvasPoint, Rectangle};
use super::fonts::{CanvasFontSize, CanvasFontPartial};

#[deno_bindgen]
#[serde(rename_all = "camelCase")]
pub enum CanvasTask {
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
    path: String,
    size: u16,
    style: Option<CanvasFontSize>,
    index: u32,
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