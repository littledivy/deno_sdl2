const encoder = new TextEncoder();

export function encode<T>(object: T): Uint8Array {
  const payload = encoder.encode(JSON.stringify(object));

  const buf = new Uint8Array(4 + payload.length);
  const view = new DataView(buf.buffer);
  view.setInt32(0, payload.byteLength, true);
  buf.set(payload, 4);

  return buf;
}

const decoder = new TextDecoder();

export async function decodeConn<T>(conn: Deno.Conn): Promise<T> {
  const eventLengthBuffer = new Uint8Array(4);
  await conn.read(eventLengthBuffer);
  const view = new DataView(eventLengthBuffer.buffer, 0);
  const eventLength = view.getUint32(0, true);

  const eventBuffer = new Uint8Array(eventLength);
  await conn.read(eventBuffer);

  const event = JSON.parse(decoder.decode(eventBuffer));
  return event as T;
}

export async function readStatus(conn: Deno.Conn): Promise<number> {
  const status = new Uint8Array(1);
  await conn.read(status);

  return status[0];
}
