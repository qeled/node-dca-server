#!/usr/bin/env node

const DEBUG = process.env.DEBUG;
const port = process.env.DCA_SERVER_PORT || 0xDCA /* 3530 */;
const host = process.env.DCA_SERVER_HOST || "127.0.0.1";

const dca = require("./dca");
const spawn = require('child_process').spawn;
const http = require('http');
const server = http.createServer(onRequest);
server.listen(port, host);

console.log(`Running at ${host}:${port}`);

function error(res, code, message) {
  res.writeHead(code, {"Content-Type": "application/json"});
  res.end(JSON.stringify({message}));
}

function onRequest(req, res){
  if (req.method !== "POST") {
    return error(res, 400, "Not a POST request");
  }
  var query = "";
  req.on("data", data => query += data);
  req.on("end", () => {
    try {
      query = query.length > 0 ? JSON.parse(query) : null;
    } catch(e) {
      return error(res, 400, "Unable to parse request: invalid JSON");
    }
    handleRequest(req, res, query)
  });
}

function handleRequest(req, res, query) {
  if (DEBUG) console.log("query", query);

  if (query == null) return error(res, 400, "Empty query");
  if (!query.input) return error(res, 400, "Undefined 'input' parameter");

  if (query.args && typeof query.args.map !== "function")
    return error(res, 400, "Parameter 'args' must be an array");

  query.frame_duration = query.frame_duration || 20;
  if (typeof query.frame_duration !== "number")
    return error(res, 400, "Parameter 'frame_duration' must be a number");

  query.compression_level = query.compression_level || 10;
  if (typeof query.frame_duration !== "number")
    return error(res, 400, "Parameter 'compression_level' must be a number");

  query.b = query.bitrate || null;
  query.ac = query.channels || null;
  query.vol = query.volume || null;

  var applications = ["voip", "audio", "lowdelay"];
  query.application = query.application || "audio";
  if (typeof query.application !== "string")
    return error(res, 400, "Parameter 'application' must be a string");
  if (applications.indexOf(query.application) < 0)
    return error(res, 400, "Parameter 'application' must be one of the following: " + applications.join(", "));


  var streamInfo = dca.createStream(query);

  res.writeHead(200, {"Content-Type": "audio/discord-dca-raw"});
  streamInfo.stream.pipe(res);

  res.on("error", () => streamInfo.process.kill());
  res.on("close", () => streamInfo.process.kill());
}