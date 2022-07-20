// Carga de Librerias Externas
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// Carga de Librerias Internas
const Oracle = require('./tools/POC_oracle.js');

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

/*
app.post('/dev/escuchando', async (req, res) => {
  let response = await OracleObj.listedForSearchs();
  res.status(200).send(response);
});
*/
// run the app server and tunneling service
app.listen(SERVERPORT, async () => {
  await OracleObj.listedForSearchs();
});
