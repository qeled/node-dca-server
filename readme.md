# node-dca-server

Node.js version of [DCA in golang](https://github.com/bwmarrin/dca) (raw mode).

Main differences - works over HTTP and encodes using ffmpeg, without opus bindings.

### Why:
* Scaling;
* Automatic process spawning and killing when TCP connection closes;
* Native encoding/decoding only using precompiled FFMpeg binary and stock Node.js.

### Why not:
* No metadata support (yet?).

## Installing

```
npm install -g qeled/node-dca-server
dca-server
```

## Request parameters

HTTP server accepts POST requests with stringified JSON object as query:

This example streams file `test.mp3` starting from 2 minute at 128kbps bitrate, stereo, maximum encoding complexity.
```
{
  input: "test.mp3", // [required] passed as -i option to ffmpeg
  args: ["-re", "-ss", "02:00"], // [optional] raw array of arguments to pass to ffmpeg before input
  frame_duration: 20, // [optional] default 20, range from 20 to 60
  bitrate: 128000, // [optional] default auto
  channels: 2, // [optional] default auto, range from 1 to 2
  volume: 256, // [optional] default auto, normal volume is 256
  compression_level: 10, // [optional] default 10, range from 0 to 10
  application: "audio" // [optional] one of "voip", "audio", "lowdelay"
}
```

Input parameter errors can be detected by status code 400 and response:

```
{"message":"<error message>"}
```

## Using as module for opus encoding

```js
var dca = require("node-dca-server/dca");
var streamInfo = dca.createOpusStream({input: "test.mp3"});
var stream = streamInfo.stream;

stream.once("readable", () => {
  var timer = setInterval(() => {
    var packet = stream.read(1); // read 1 opus packet
    if (!packet) {
      streamInfo.process.kill();
      return clearInterval(timer);
    }
    console.log(packet);
  }, 20);
});
```


## Debug mode

Set environment variable `DEBUG` to see query parameters and ffmpeg output:

### Linux
```
DEBUG=true node dca-server
```

### Windows
```
set DEBUG=true
node dca-server
```
