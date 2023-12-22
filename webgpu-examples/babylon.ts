import { EventType, WindowBuilder } from "../mod.ts";

import BABYLON from "npm:babylonjs@5.30.0"
import "npm:babylonjs-loaders@5.30.0"
import glslang from "https://deno.land/x/glslang/mod.ts";
import "https://cdn.babylonjs.com/twgsl/twgsl.js"

const window = new WindowBuilder("Hello, Deno!", 640, 480).build();
const [system, windowHandle, displayHandle] = window.windowHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);

var createScene = function () {
  // This creates a basic Babylon Scene object (non-mesh)
  var scene = new BABYLON.Scene(engine);

  // This creates and positions a free camera (non-mesh)
  var camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 5, -10),
    scene,
  );

  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene,
  );

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;

  // Our built-in 'sphere' shape.
  var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {
    diameter: 2,
    segments: 32,
  }, scene);

  // Move the sphere upward 1/2 its height
  sphere.position.y = 1;

  // Our built-in 'ground' shape.
  var ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: 6,
    height: 6,
  }, scene);

  return scene;
};

navigator.gpu.getPreferredCanvasFormat = () => "bgra8unorm";
var context;
class CanvasCtx extends EventTarget {
  getContext() {
    /* GPUCanvasContext */
    console.log("getContext");
    context = createWindowSurface(system, windowHandle, displayHandle);
    const configure = context.configure;
    context.configure = function (desc) {
      desc.width = 640;
      desc.height = 480;
      desc.usage = GPUTextureUsage.RENDER_ATTACHMENT;
      desc.alphaMode = "opaque";
      return configure.call(context, desc);
    };
    return context;
  }

  width = 640;
  height = 480;
}

GPUDevice.prototype.addEventListener = function (type, listener) {};

const c = new CanvasCtx();
var engine = new BABYLON.WebGPUEngine(c);
await engine.initAsync({ glslang }, { twgsl: await globalThis.twgsl("https://cdn.babylonjs.com/twgsl/twgsl.wasm") });

var scene = createScene();

engine.runRenderLoop(function () {
  const { value } = window.events().next();
  if (value.type === EventType.Quit) {
    Deno.exit(0);
  }

  if (value.type === EventType.Draw) {
    scene.render();
    context.present();
    console.log(engine.getFps().toFixed() + " fps");
  }
});
