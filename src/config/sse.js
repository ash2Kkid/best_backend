const clients = new Map(); // userId -> Set(res)

export function addClient(userId, res) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId).add(res);
}

export function removeClient(userId, res) {
  if (!clients.has(userId)) return;
  clients.get(userId).delete(res);
  if (clients.get(userId).size === 0) {
    clients.delete(userId);
  }
}

export function broadcastToUser(userId, event, data) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const payload =
    `event: ${event}\n` +
    `data: ${JSON.stringify(data)}\n\n`;

  for (const res of userClients) {
    res.write(payload);
  }
}