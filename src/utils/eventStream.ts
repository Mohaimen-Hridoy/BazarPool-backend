import { Response } from 'express';

// In-memory list of active SSE client connections
const clients: Response[] = [];

export const addSSEClient = (res: Response) => {
  clients.push(res);
  res.on('close', () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) {
      clients.splice(idx, 1);
    }
  });
};

export const broadcastLiveEvent = (eventType: string, data: any) => {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  }
};

