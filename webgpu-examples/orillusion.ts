import {
  AtmosphericComponent,
  Camera3D,
  CameraUtil,
  Color,
  Engine3D,
  GPUCullMode,
  KelvinUtil,
  MeshRenderer,
  Object3D,
  Object3DUtil,
  PlaneGeometry,
  Scene3D,
  SkyRenderer,
  SolidColorSky,
  UnLitMaterial,
  Vector3,
  View3D,
} from "../../orillusion/dist/orillusion.es.max.js";
import { EventType, WindowBuilder } from "../mod.ts";

const width = 640;
const height = 480;
const window = new WindowBuilder("Hello, Deno!", width, height).build();
const [system, windowHandle, displayHandle] = window.windowHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);

let context;
class Canvas extends EventTarget {
  constructor() {
    super();
  }

  getContext() {
    context = createWindowSurface(system, windowHandle, displayHandle);
    const orgConfigure = context.configure;

    context.configure = function (desc) {
      desc.usage = GPUTextureUsage.RENDER_ATTACHMENT;
      desc.alphaMode = "opaque";
      desc.height = height;
      desc.width = width;
      orgConfigure.call(context, desc);
    };

    return context;
  }

  style = {};

  clientWidth = width;
  clientHeight = height;

  getBoundingClientRect() {
    return {
      width,
      height,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
    };
  }
}

const canvas = new Canvas();

function lateRender() {
  context.present();
}

await Engine3D.init({ canvasConfig: { canvas }, lateRender });

const scene = new Scene3D();
const camera = CameraUtil.createCamera3DObject(scene);
camera.perspective(45, Engine3D.aspect, 0.01, 1000);

let sky = scene.getOrAddComponent(AtmosphericComponent);
let texture = sky["_atmosphericScatteringSky"];
let ulitMaterial = new UnLitMaterial();
ulitMaterial.baseMap = texture.texture2D;
ulitMaterial.cullMode = GPUCullMode.none;
let obj = new Object3D();
scene.addChild(obj);
let r = obj.addComponent(MeshRenderer);
r.material = ulitMaterial;
r.geometry = new PlaneGeometry(100, 50, 1, 1, Vector3.Z_AXIS);
scene.addChild(obj);

let view = new View3D();
view.scene = scene;
view.camera = camera;

let cb = [];
globalThis.requestAnimationFrame = function requestAnimationFrame(callback) {
  cb.push(callback);
  return cb.length - 1;
};

Engine3D.startRenderView(scene.view);
let i = 0;
function main() {
  const event = window.events().next().value;
  if (event.type === EventType.Quit) {
    Deno.exit();
  }

  if (event.type == EventType.Draw) {
    cb.shift()();

    // Update camera
    view.camera.lookAt(
      new Vector3(
        Math.sin(i) * 10,
        Math.cos(i) * 10,
        Math.sin(i) * 10,
      ),
      new Vector3(0, 0, 0),
      Vector3.Z_AXIS,
    );
    i += 0.01;
  }
}

setInterval(() => {
  main();
}, 0);
