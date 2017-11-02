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
   * @param {stream~Duplex} stream - The connected stream.
   * @param {object} [opts={writableObjectMode: true, readableObjectMode: true}]
   * opts - The opts to pass into the {@link stream~Duplex} constructor.
   */
  constructor (stream, opts = {
    writableObjectMode: true,
    readableObjectMode: true,
  })
  {
    super(opts);

    if (!stream) throw TypeError('Expected stream option');

    /** The connectied stream */
    this._stream = stream;

    /** The encoding transform */
    const encoder = this._encoder = this.constructor.encoder();

    /** The decoding transform */
    const decoder = this._decoder = this.constructor.decoder();

    stream.on('data', (...args) => decoder.write(...args));
    encoder.on('data', (...args) => stream.write(...args));
    decoder.on('data', (...args) => this.emit('data', ...args));
  }

  /**
   * @abstract
   * Gets a new encoder
   * @returns {stream~Transform}
   */
  static encoder ()
  {
    return new PassThrough();
  }

  /**
   * @abstract
   * Gets a new decoder
   * @returns {stream~Transform}
   */
  static decoder ()
  {
    return new PassThrough();
  }

  /**
   * @override
   * Recieves output directly from {@link Transcoder#_decoder}.
   */
  _read (size)
  {
    this.push(this._decoder.read(size));
  }

  /**
   * @override
   * Writes input directly to {@link Transcoder#_encoder}.
   */
  _write (chunk, enc, cb)
  {
    this._encoder.write(chunk, enc, cb);
  }
}
