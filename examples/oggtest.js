var fs = require("fs");
var OggOpusDemuxer = require("../ogg-opus-demuxer");
var DCAMuxer = require("../dca-muxer");

var s = fs.createReadStream("test.ogg");
var ogg = new OggOpusDemuxer();
var dca = new DCAMuxer();
s.pipe(ogg).pipe(dca).pipe(fs.createWriteStream("test.dca"));