"use strict";

const Transform = require("stream").Transform;
class DCAMuxer extends Transform {
  _transform(chunk, encoding, done) {
    var length = new Buffer(2);
    length.writeUInt16LE(chunk.length, 0);

    this.push(Buffer.concat([length, chunk]));
    done();
  }
}

module.exports = DCAMuxer;