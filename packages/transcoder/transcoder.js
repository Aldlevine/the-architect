const {Duplex, PassThrough} = require('stream');

/**
 * A class representing the base transcoder mechanism
 * @extends {stream~Duplex}
 */
module.exports = class Transcoder extends Duplex
{
  /**
   * Creates a transcoder.
   * @param {object} [opts={}] - The configuration options.
   * @param {stream~Transform} [opts.encoder=new stream.PassThrough] - The encoding transform
   * @param {stream~Transform} [opts.decoder=new stream.PassThrough] - The decoding transform
   */
  constructor ({
    encoder = new PassThrough(),
    decoder = new PassThrough(),
  }={})
  {
    this._encoder = encoder;
    this._decoder = decoder;
  }
}
