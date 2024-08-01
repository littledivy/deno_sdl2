if (
  typeof WorkerGlobalScope === "undefined" ||
  !(self instanceof WorkerGlobalScope)
) {
  const selfPath = new URL(import.meta.url).pathname;
  const worker = new Worker(`file://${selfPath}`, { type: "module" });
} else {
  const ws = new WebSocket('ws://localhost:1234');
  self.onmessage = (event) => {
    ws.send(event.data);
  };
}
