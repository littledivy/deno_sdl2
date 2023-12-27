import { EventType, WindowBuilder } from "../mod.ts";
import glslang from "https://deno.land/x/glslang@1.0.1/mod.ts";
import "https://cdn.babylonjs.com/twgsl/twgsl.js";

const twgsl = await globalThis.twgsl("https://cdn.babylonjs.com/twgsl/twgsl.wasm");

const shaderFile = Deno.args[0];
if (!shaderFile) {
  console.error("No shader file provided");
  Deno.exit(1);
}

const width = 512;
const height = 512;

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter!.requestDevice();

const window = new WindowBuilder(shaderFile, width, height).alwaysOnTop().build();
const [system, windowHandle, displayHandle] = window.rawHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);
console.log("Display: ", displayHandle);

const context = createWindowSurface(system, windowHandle, displayHandle);

let pipeline;
function createPipeline() {
    let shader = Deno.readTextFileSync(shaderFile);
    let fragEntry = "fs_main";
    if (shaderFile.endsWith(".glsl")) {
        const spirv = glslang.compileGLSL(shader, "fragment");
        shader = twgsl.convertSpirV2WGSL(spirv);

        shader = `
struct VertexInput {
    @builtin(vertex_index) vertex_index: u32,
};

@vertex
fn vs_main(in: VertexInput) -> @builtin(position) vec4<f32> {
    // Default vertex shader
    var vertices = array<vec2<f32>, 3>(
        vec2<f32>(-1., 1.),
        vec2<f32>(3.0, 1.),
        vec2<f32>(-1., -3.0),
    );

    return vec4<f32>(vertices[in.vertex_index], 0.0, 1.0);
}

${shader}
`;
        fragEntry = "main";
    }

    const shaderModule = device.createShaderModule({
        code: shader,
        label: shaderFile,
    });
    
    pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [] }),
        vertex: {
            module: shaderModule,
            entryPoint: "vs_main",
            buffers: [],
        },
        fragment: {
            module: shaderModule,
            entryPoint: fragEntry,
            targets: [
                {
                    format: "bgra8unorm",
                },
            ],
        },
    });

    window.raise();
}

createPipeline();

context.configure({
    device,
    format: "bgra8unorm",
    width,
    height
});

function run() {
    const event = window.events().next().value;
    if (event.type === EventType.Quit) Deno.exit(0);
    if (event.type == EventType.Draw) {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
    
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
        });
    
        renderPass.setPipeline(pipeline);
        renderPass.draw(3, 1);
        renderPass.end();
    
        device.queue.submit([commandEncoder.finish()]);
        context.present();
    }
}

setInterval(run, 0);

const wacher = Deno.watchFs(shaderFile);
for await (const event of wacher) {
    console.log("Shader changed, reloading...");
    createPipeline();
}