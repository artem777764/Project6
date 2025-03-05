const WebSocket = require('ws');

const webSocketServer = new WebSocket.Server({port: 8000});
webSocketServer.on('connection', ws => {
    console.log('Client connected');
  
    ws.on('message', message => {
      // Если message является Buffer, преобразуем его в строку
      const textMessage = Buffer.isBuffer(message) ? message.toString() : message;
      console.log(`Received message: ${textMessage}`);
  
      // Рассылаем строковое сообщение всем подключённым клиентам
      webSocketServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(textMessage);
        }
      });
    });
  
    ws.on('error', error => {
      console.log('WebSocket error: ', error);
      ws.send('An error occurred');
    });
  
    ws.send('Hi there, I am a WebSocket server');
  });
  