const fs = require('fs-extra');
const md5 = require('md5');
const bodyParser = require("body-parser");
const express = require('express');
const http = require('http');
const ws = require('ws');

const app = express();
const listenPort = 9002;

app.use(express.static(__dirname));

app.listen(listenPort, () => console.log('http://localhost:' + listenPort));

const httpServer = http.createServer(app);
const webSocketServer = new ws.Server({ server: httpServer, port: 9102 });

let clientSockets = [];

webSocketServer.on('connection', (socket) => {
  console.log('new connection');

  clientSockets.push(socket);

  sendJson(socket, {
    to: 'chat',
    message: 'welcome',
  });

  socket.on('message', (rawMessage) => {
    console.log('received', rawMessage);

    try {
      const message = JSON.parse(rawMessage);
      switch (message.to) {
        case "chat":
          handleMessageChat(message);
          break;
        default:
          console.error("unrecognized message", rawMessage);
      }
    }
    catch (e) {
      console.error(e);
    }
  });
});

function sendJson(s, o) {
  s.send(JSON.stringify(o));
}

function handleMessageChat(message) {
  clientSockets.forEach(function (socket) {
    try {
      sendJson(socket, message);
    }
    catch (e) {
      console.error(e);
    }
  });

  sendJson(masterSocket, message);
}
