var dca = require("../dca");

if (!require("fs").existsSync("test.mp3"))
  return console.log("Input file not found");

var d = dca.createStream({input: "test.mp3"});

d.stream.on("data", data => { console.log(data) });
