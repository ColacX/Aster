const fs = require('fs-extra');
const md5 = require('md5');
const bodyParser = require("body-parser");
const express = require('express');
const app = express();
const listenPort = 9002;

app.use(express.static(__dirname));

app.listen(listenPort, () => console.log('http://localhost:' + listenPort));