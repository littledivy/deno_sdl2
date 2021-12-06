use deno_bindgen::deno_bindgen;

use sdl2::ttf::FontStyle;

#[deno_bindgen]
pub struct CanvasColor {
  pub r: u8,
  pub g: u8,
  pub b: u8,
  pub a: u8,
}

#[deno_bindgen]
#[serde(rename_all = "lowercase")]
pub enum CanvasFontPartial {
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
pub enum CanvasFontSize {
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
