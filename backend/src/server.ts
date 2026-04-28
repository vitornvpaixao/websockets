import { WebSocketServer } from 'ws';
import { config } from '../config';

const { PORT, HOST } = config;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', (data, isBinary) => {
    console.log(`[${new Date().toISOString()}] received: ${data}`);

    wss.clients.forEach(cli => {
        if (cli !== ws && cli.readyState == WebSocket.OPEN) {
          cli.send(data, {binary: isBinary}, (err) => {
              if (err) console.error('WS send error: ', err);
            }
          );
        }
    })
  });
});

console.log(`Server running at: ws://${HOST}:${PORT}`);
