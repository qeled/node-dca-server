var dca = require("../dca");

if (!require("fs").existsSync("test.mp3"))
  return console.log("Input file not found");

var streamInfo = dca.createOpusStream({input: "test.mp3"});
var stream = streamInfo.stream;

stream.once("readable", () => {
  var timer = setInterval(() => {
    var packet = stream.read(1); // read 1 packet
    if (!packet) {
      streamInfo.process.kill();
      return clearInterval(timer);
    }
    
    console.log(packet.length);
  }, 20);
});