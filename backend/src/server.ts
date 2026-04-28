import { WebSocketServer } from 'ws';
import { config } from '../config';

const { PORT, HOST } = config;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data, isBinary) {
    console.log('received: %s', data);

    wss.clients.forEach(cli => {
        if (cli !== ws && cli.readyState == WebSocket.OPEN) {
            cli.send(data, {binary: isBinary});
        }
    })
  });
});

console.log(`Server running at: ws://${HOST}:${PORT}`);
