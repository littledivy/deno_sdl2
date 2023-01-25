import { VideoSubsystem } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";

Deno.test("VideoSubsystem#currentVideoDriver", () => {
  const video = new VideoSubsystem();
  const info = video.currentVideoDriver();
  assertEquals(typeof info, "string");
});
