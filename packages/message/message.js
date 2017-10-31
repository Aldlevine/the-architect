const UUID = require('uuid/v4');

/**
 * A virtual type representing a message scheme.
 * These should be retrieved from {@link Message.schemes}.
 * @typedef {number|string} Scheme
 */

/** A class representing a message. */
module.exports = class Message
{

  /**
   * Creates a message.
   * @param {Scheme} scheme - The message scheme.
   * @param {Object} [headers={}] - The message headers.
   * @param {Object} [body={}] - The message body.
   * @return {Message}
   */
  constructor (scheme, headers={}, body={})
  {
    // validate scheme
    if (!(scheme in Message.schemes)) {
      throw new TypeError(`"${scheme}" is not a valid message scheme.`);
    }

    // validate required headers
    const requiredHeaders = Message._requiredHeaders[scheme];
    for (let header of requiredHeaders) {
      if (!(header in headers)) {
        throw new TypeError(`Excpected "${header}" header for "${scheme}" message.`);
      }
    }

    // validate reserved headers
    const reservedHeaders = Message._reservedHeaders[scheme];
    for (let header of reservedHeaders) {
      if (header in headers) {
        throw new TypeError(`The "${header}" header is reserved for "${scheme}" messages.`);
      }
    }

    /** packs data in array for smaller package */
    this._data = [scheme, {...headers, id: UUID()}, body];
  }

  /**
   * Creates a message directly from the data component of another message.
   * This is intended for rebuilding a message after deserialization.
   * @param {Array} data - The message data.
   * @return {Message} The message represented by the data.
   */
  static fromData (data)
  {
    const msg = Object.create(Message.prototype);
    msg._data = data;
    return msg;
  }

  /**
   * Gets the message data.
   * @type {Array<Scheme, Object, Object>}
   */
  get data () {return this._data}

  /**
   * Gets the message scheme.
   * @type {Scheme}
   */
  get scheme () {return this._data[0]}

  /**
   * Gets the message headers.
   * @type {Object}
   */
  get headers () {return this._data[1]}

  /**
   * Gets the message body.
   * @type {Object}
   */
  get body () {return this._data[2]}
  /**
   * Sets the message body.
   * @param {Object} _
   */
  set body (v) {this._data[2] = v}

  /**
   * A handy way to access different schemes without fear of typos.
   * @type {Map<string, Scheme>}
   * @property {Scheme} PUB - The publish scheme.
   * @property {Scheme} SUB - The subscribe scheme.
   * @property {Scheme} REQ - The request scheme.
   * @property {Scheme} RES - The response scheme.
   * @property {Scheme} DIR - The direct message scheme.
   * @property {Scheme} QUE - The service registry query scheme.
   * @property {Scheme} SRV - The service registry announce scheme.
   */
  static get schemes ()
  {
    return {
      get PUB () {return 'PUB'},
      get SUB () {return 'SUB'},
      get REQ () {return 'REQ'},
      get RES () {return 'RES'},
      get DIR () {return 'DIR'},
      get QUE () {return 'QUE'},
      get SRV () {return 'SRV'},
    }
  }

  /**
   * The headers that are required for each message scheme.
   * @return {Map<Scheme, string[]>}
   */
  static get _requiredHeaders ()
  {
    const {PUB, SUB, REQ, RES, DIR, QUE, SRV} = Message.schemes;
    return {
      [PUB]: ['src', 'tag'],
      [SUB]: ['src', 'tag'],
      [REQ]: ['src', 'uri'],
      [RES]: ['src', 'res'],
      [DIR]: ['src', 'tgt'],
      [QUE]: ['src'],
      [SRV]: [],
    }
  }

  /**
   * The headers that are reserved for each message scheme.
   * @return {Map<Scheme, string[]>}
   */
  static get _reservedHeaders ()
  {
    const {PUB, SUB, REQ, RES, DIR, QUE, SRV} = Message.schemes;
    return {
      [PUB]: ['id'],
      [SUB]: ['id'],
      [REQ]: ['id'],
      [RES]: ['id'],
      [DIR]: ['id'],
      [QUE]: ['id'],
      [SRV]: ['id'],
    }
  }
}
