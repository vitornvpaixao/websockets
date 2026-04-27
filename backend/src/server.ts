import { WebSocketServer } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data, isBinary) {
    console.log('received: %s', data);

    wss.clients.forEach(cli => {
        if (cli !== ws) {
            cli.send(data, {binary: isBinary});
        }
    })
  });
});

console.log(`Server is running in: ws://localhost:${PORT}`);
