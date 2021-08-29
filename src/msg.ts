// @ts-ignore
const encoder = Deno.core?.encode || new TextEncoder().encode;

let encodeu8 = new Uint8Array(1024);
let encodeu32 = new Uint32Array(encodeu8.buffer);

export function encode<T>(object: T): Uint8Array {
  // ~0.02ms
  const payload = encoder(JSON.stringify(object));

  // ~0.17ms - ~0.02ms
  const len = 4 + payload.length;

  if (len > encodeu8.length) {
    encodeu8 = new Uint8Array(Math.ceil(len / 4) * 4);
    encodeu32 = new Uint32Array(encodeu8.buffer);
  }
  const buf = encodeu8.subarray(0, len);
  encodeu32[0] = payload.byteLength;

  buf.set(payload, 4);
  return buf;
}

// @ts-ignore
const decoder = Deno.core?.decode || new TextDecoder().decode;

const su8 = new Uint8Array(4);
let last = new Uint8Array(1024);
const su32 = new Uint32Array(su8.buffer);

export async function decodeConn<T>(conn: Deno.Conn): Promise<T> {
  // ~0.07ms
  await conn.read(su8);

  // ~0.01ms
  const eventLength = su32[0];

  // ~0.03ms
  if (eventLength > last.length) last = new Uint8Array(eventLength);
  const buf = last.subarray(0, eventLength);
  await conn.read(buf);

  // ~0.02ms
  const event = JSON.parse(decoder(buf));
  return event as T;
}

const status = new Uint8Array(1);
export async function readStatus(conn: Deno.Conn): Promise<number> {
  await conn.read(status);

  return status[0];
}
