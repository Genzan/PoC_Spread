// Carga de Librerias Externas
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ipfsClient = require('ipfs-http-client');
// Carga de Librerias Internas
const POC = require('./tools/POC.js');

const SERVERPORT = "8010";

const POCObj = new POC();
const app = express();

var rawBodyHandler = function (req, res, buf, encoding) {
  if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
  }
}

app.use(cors({ allowedHeaders: 'Content-Type, Cache-Control' }));
app.options('*', cors());
app.use(bodyParser.json({ verify: rawBodyHandler }));

app.post('/dev/nueva_busqueda', async (req, res) => {
  const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001,protocol: 'https' });
  const object  = await ipfs.add(JSON.stringify(req.body._json));
  let cid = "";
  for await (const item of object) {
    cid = item;
    break;
  }
  let response = await POCObj.addBusqueda(
    req.body._address, req.body._privateKey, req.body._uuid, req.body._curp, cid.path);
  res.status(200).send(response);
});

app.post('/dev/nuevo_resultado', async (req, res) => {
  const ipfs = new ipfsClient({ host: 'ipfs.infura.io', port: 5001,protocol: 'https' });
  const object  = await ipfs.add(JSON.stringify(req.body._json));
  let cid = "";
  for await (const item of object) {
    cid = item;
    break;
  } 
  let response = await POCObj.addResultado(
    req.body._address, req.body._privateKey, req.body._uuid, req.body._found, cid.path);
  res.status(200).send(response);
});

app.get('/dev/cid_busqueda', async (req, res) => {
  let response = await POCObj.getSearchCID(req.body._uuid);
  res.status(200).send(response);
});

app.get('/dev/obtener_resultados', async (req, res) => {
  let response = await POCObj.getResults(req.body._uuid);
  res.status(200).send(response);
});

app.get('/dev/estatus_busqueda', async (req, res) => {
  let response = await POCObj.isOpen(req.body._uuid);
  res.status(200).send(response);
});

// run the app server and tunneling service
app.listen(SERVERPORT, () => {
  console.log(`Demo listening at http://localhost:${SERVERPORT}`)
});