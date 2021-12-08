// struct VertexInput {
//     [[location(0)]] position: vec3<f32>;
//     [[location(1)]] color: vec3<f32>;
// };

// struct VertexOutput {
//     [[builtin(position)]] clip_position: vec4<f32>;
//     [[location(0)]] color: vec3<f32>;
// };

// [[stage(vertex)]]
// fn vs_main(
//     model: VertexInput,
// ) -> VertexOutput {
//     var out: VertexOutput;
//     out.color = model.color;
//     out.clip_position = vec4<f32>(model.position, 1.0);
//     return out;
// }

// [[stage(fragment)]]
// fn fs_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
//     return vec4<f32>(in.color, 1.0);
// }

[[stage(vertex)]]
fn vs_main([[builtin(vertex_index)]] in_vertex_index: u32) -> [[builtin(position)]] vec4<f32> {
    let x = f32(i32(in_vertex_index) - 1);
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1);
    return vec4<f32>(x, y, 0.0, 1.0);
}
[[stage(fragment)]]
fn fs_main() -> [[location(0)]] vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}