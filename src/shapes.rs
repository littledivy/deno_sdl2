use deno_bindgen::deno_bindgen;

#[deno_bindgen]
pub struct CanvasPoint {
  pub x: i32,
  pub y: i32,
}

#[deno_bindgen]
pub struct Rectangle {
  pub x: i32,
  pub y: i32,
  pub width: u32,
  pub height: u32,
}

#[deno_bindgen]
pub struct OptionRectangle {
  pub x: i32,
  pub y: i32,
  pub width: Option<u32>,
  pub height: Option<u32>,
}
