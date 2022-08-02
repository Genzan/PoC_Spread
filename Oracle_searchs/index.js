// Carga de Librerias Externas
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// Carga de Librerias Internas
const Oracle = require('./tools/Oracle_searchs.js');

const SERVERPORT = "8010";

const OracleObj = new Oracle();
const app = express();

var rawBodyHandler = function (req, res, buf, encoding) {
  if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
  }
}

app.use(cors({ allowedHeaders: 'Content-Type, Cache-Control' }));
app.options('*', cors());
app.use(bodyParser.json({ verify: rawBodyHandler }));

// run the app server and tunneling service
app.listen(SERVERPORT, async () => {
  await OracleObj.listenForSearchs();
});
