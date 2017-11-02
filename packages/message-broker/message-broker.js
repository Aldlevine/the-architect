const EventEmitter = require('events');
const {Server} = require('net');
const UUID = require('uuid');
const ServiceRegistry = require('@the-architect/service-registry');
const Message = require('@the-architect/message');
const JSONTranscoder = require('@the-architect/transcoder/json-transcoder');
const log = require('debug')('@the-architect:message-broker');

/**
 * A class representing a message broker
 * @extends {events~EventEmitter}
 */
module.exports = class MessageBroker extends EventEmitter
{
  /**
   * Creates a message broker.
   * @param {object} opts - The configuration options.
   * @param {net~Server} [opts.server=new net.Server] - The server to attach the message broker to.
   * @param {#Transcoder} [transcoder=JSONTranscoder] - The transcoder.
   * @return {MessageBroker}
   */
  constructor ({
    server = new Server(),
    transcoder = JSONTranscoder
  }={})
  {
    super();

    /** The server instance */
    this._server = server;

    /** The transcoder constructor */
    this._transcoder = transcoder;

    this._initEvents();
  }

  /**
   * A proxy to the {@link net~Server#listen} method on {@link MessageBroker#server}.
   * @param {...object} [args] - The args that get passed to {@link net~Server#listen}.
   */
  listen (...args)
  {
    this._server.listen(...args);
  }

  /**
   * Gets the message broker's server
   * @type {net~Server}
   */
  get server () {return this._server}


  /** Initializes the event listeners */
  _initEvents ()
  {
    const server = this._server;

    const events = ['close', 'connection', 'error', 'listening'];
    for (let event of events) {
      server.on(event, (...args) => {
        this[`_on_${event}`](...args);
        this.emit(event, ...args)
      });
    }
  }

  /** The 'close' event handler */
  _on_close ()
  {
    log('server closed');
  }


  /** The 'connection' event handler */
  _on_connection (socket)
  {
    log('received connection');
    const transcoder = new this._transcoder(socket);

    transcoder.on('data', (data) => {
      log('recieved data');
      // transcoder.write(data);
    });

    socket.on('close', () => log('close'));
  }

  /** The 'error' event handler */
  _on_error (err)
  {
    log(err);
  }

  /** The 'listening' event handler */
  _on_listening ()
  {
    log('listening');
  }
}
