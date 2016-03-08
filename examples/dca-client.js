var query = JSON.stringify({input: "test.mp3"});

var req = new (require('http').ClientRequest)({
  hostname: "localhost",
  port: 0xDCA,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": query.length
  }
});

req.on("response", res => {
  console.log("Status code:", res.statusCode);
//  res.on("data", data => console.log("received", data));
  res.pipe(require("fs").createWriteStream("test.dca"));
});
req.end(query);