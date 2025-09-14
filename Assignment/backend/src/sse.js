// Simple SSE broadcaster for rating updates
const clients = new Set();

export function addClient(res) {
  clients.add(res);
}

export function removeClient(res) {
  clients.delete(res);
}

export function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (_) {
        clients.delete(res);
    }
  }
}

export function clientCount() {
  return clients.size;
}
