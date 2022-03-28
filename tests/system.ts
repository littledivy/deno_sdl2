import { VideoSubsystem } from "../mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("VideoSubsystem#currentVideoDriver", () => {
  const video = new VideoSubsystem();
  const info = video.currentVideoDriver();
  assertEquals(typeof info, "string");
});
