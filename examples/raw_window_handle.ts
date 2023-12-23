import { EventType, WindowBuilder } from "../mod.ts";

const window = new WindowBuilder("Raw window handle", 640, 480).build();
const [system, windowHandle, displayHandle] = window.rawHandle();

console.log("System: ", system);
console.log("Window: ", windowHandle);
console.log("Display: ", displayHandle);

for (const event of window.events()) {
  if (event.type === EventType.Quit) break;
}
