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

webSocketServer.on('connection', (socket) => {

  //connection is up, let's add a simple simple event
  socket.on('message', (message) => {

    //log the received message and send it back to the client
    console.log('received: %s', message);
    socket.send(`Hello, you sent -> ${message}`);
  });

  //send immediatly a feedback to the incoming connection    
  socket.send('Hi there, I am a WebSocket server');
});