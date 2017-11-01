const {Duplex, PassThrough} = require('stream');

/**
 * A class representing the base transcoder mechanism. It wraps another duplex
 * stream and encodes data when written and decodes data when read.
 * @extends {stream~Duplex}
 */
module.exports = class Transcoder extends Duplex
{
  /**
   * Creates a transcoder.
   * @param {object} [opts={}] - The configuration options.
   * @param {stream~Duplex} opts.stream - The connected stream.
   * @param {stream~Transform} [opts.encoder=new stream.PassThrough] - The encoding transform.
   * @param {stream~Transform} [opts.decoder=new stream.PassThrough] - The decoding transform.
   */
  constructor ({
    stream,
    encoder = new PassThrough(),
    decoder = new PassThrough(),
  }={}, opts = {
    writableObjectMode: true,
    readableObjectMode: true,
  })
  {
    super(opts);

    if (!stream) throw TypeError('Expected stream option');

    /** The connectied stream */
    this._stream = stream;

    /** The encoding transform */
    this._encoder = encoder;

    /** The decoding transform */
    this._decoder = decoder;

    encoder.pipe(stream);
    stream.pipe(decoder);
  }

  _read (size)
  {
    this.push(this._decoder.read(size));
  }

  _write (chunk, enc, cb)
  {
    this._encoder.write(chunk, enc, cb);
  }
}
