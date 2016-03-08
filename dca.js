"use strict";

const DEBUG = process.env.DEBUG;

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const OggOpusDemuxer = require("./ogg-opus-demuxer");
const DCAMuxer = require("./dca-muxer");

function getConverter(args, options) {
  var binaries = [
    'ffmpeg',
    'ffmpeg.exe',
    'avconv',
    'avconv.exe'
  ];

  var paths = process.env.PATH.split(path.delimiter).concat(["."]);

  for (var name of binaries) {
    for (var p of paths) {
      var binary = p + path.sep + name;
      if (!fs.existsSync(binary)) continue;
      return spawn(name, args, options);
    }
  }
  return null;
}

module.exports = {
  createConverter(options) {
    var opusargs = [
      "frame_duration", "compression_level", "application", "b", "ac", "vol"
    ];

    options = options || {};
    options.args = options.args || [];

    // add -i
    if (options.input)
      options.args = options.args.concat(["-i", options.input]);

    // add codec and format options
    options.args = options.args.concat([
      "-c:a", "libopus",
      "-ar", 48000,
      "-f", "ogg"
    ]);

    // convert opus parameters from options, ignoring unspecified/null values
    options.args = [].concat.apply(options.args,
      opusargs.map(arg =>
        options[arg] ? [ `-${arg}:a`, options[arg] ] : []
     )
    );

    // add output to stdout
    options.args = options.args.concat(["-"]);

    if (DEBUG) console.log("Spawning ffmpeg with args:", options.args);

    var ffmpeg = getConverter(
      options.args,
      {stdio: ['pipe', 'pipe', DEBUG ? 'pipe': 'ignore']}
    );
    if (!ffmpeg) return console.log("ffmpeg/avconv not found");

    if (DEBUG) ffmpeg.stderr.pipe(process.stderr);

    ffmpeg.stdout._readableState.highWaterMark = 1024 * 4;

    return ffmpeg;
  },
  createStream(options) {
    var ffmpeg = this.createConverter(options);
    var demuxer = new OggOpusDemuxer();
    var dcamuxer = new DCAMuxer();
    ffmpeg.stdout.pipe(demuxer).pipe(dcamuxer);

    return {process: ffmpeg, stream: dcamuxer};
  },
  createOpusStream(options) {
    var ffmpeg = this.createConverter(options);
    var demuxer = new OggOpusDemuxer();
    ffmpeg.stdout.pipe(demuxer);

    return {process: ffmpeg, stream: demuxer};
  }
};