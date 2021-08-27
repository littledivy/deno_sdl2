const encoder = new TextEncoder();

export function encode<T>(object: T): Uint8Array {
  const payload = encoder.encode(JSON.stringify(object));

  const buf = new Uint8Array(4 + payload.length);
  const view = new DataView(buf.buffer);
  view.setInt32(0, payload.byteLength, true);
  buf.set(payload, 4);

  return buf;
}

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
  // @ts-ignore
  const event = JSON.parse(Deno.core.decode(buf));
  return event as T;
}

const status = new Uint8Array(1);
export async function readStatus(conn: Deno.Conn): Promise<number> {
  await conn.read(status);

  return status[0];
}
