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

let slaveSockets = [];
let masterSocket = null;

webSocketServer.on('connection', (s) => {
  console.log('new connection');

  sendJson(s, {
    to: 'chat',
    message: 'welcome',
  });

  s.on('message', (message) => {
    console.log('received', message);

    try {
      const m = JSON.parse(message);
      switch (m.to) {
        case "server":
          handleMessageServer(m, s);
          break;
        case "master":
          handleMessageMaster(m);
          break;
        case "slaves":
          handleMessageSlaves(m);
          break;
        case "chat":
          handleMessageChat(m);
          break;
        default:
          console.error("unrecognized message", message);
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

function handleMessageServer(m, s) {
  switch (m.type) {
    case "role":
      if (m.isMaster) {
        if (masterSocket) {
          console.error('master already exists. todo handle this');
        }
        masterSocket = s;
      }
      else {
        slaveSockets.push(s);
      }
      break;
    default:
      console.error('unrecognized message', m);
  }
}

function handleMessageChat(m) {
  slaveSockets.forEach(function (s) {
    try {
      sendJson(s, m);
    }
    catch (e) {
      console.error(e);
    }
  });

  sendJson(masterSocket, m);
}

function handleMessageMaster(m) {
}

function handleMessageSlaves(m) {
}