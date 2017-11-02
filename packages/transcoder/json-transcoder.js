const {Transform} = require('stream');

/**
 * The default transcoder. Converts to and from JSON.
 * @extends {Transcoder}
 */
module.exports = class JSONTranscoder extends require('./transcoder')
{
  /**
   * @override
   * @returns {stream~Transform}
   */
  static encoder ()
  {
    return new Transform({
      writableObjectMode: true,
      transform (chunk, enc, cb) {
        this.push(JSON.stringify(chunk));
        cb();
      }
    });
  }

  /**
   * @override
   * @returns {stream~Transform}
   */
  static decoder ()
  {
    return new Transform({
      readableObjectMode: true,
      transform (chunk, enc, cb) {
        this.push(JSON.parse(chunk));
        cb();
      }
    });
  }
}

