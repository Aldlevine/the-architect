const test = require('ava');
const {Transform, PassThrough} = require('stream');
const net = require('net');
const Mitm = require('mitm');
const Transcoder = require('../../packages/transcoder');

const decoded = {foo: 'bar', baz: 'bat'};
const encoded = '{"foo":"bar","baz":"bat"}';

test.beforeEach((t) => {

  t.context.encoder = new Transform({
    writableObjectMode: true,
    transform (chunk, enc, cb) {
      this.push(JSON.stringify(chunk));
      cb();
    }
  });

  t.context.decoder = new Transform({
    readableObjectMode: true,
    transform (chunk, enc, cb) {
      this.push(JSON.parse(chunk));
      cb();
    }
  });

  t.context.mitm = Mitm();
});

test.afterEach((t) => {
  t.context.mitm.disable();
});

test('Requires stream option', (t) => {
  t.throws(() => {
    new Transcoder();
  }, TypeError);
});

test('Allows defaults transforms', (t) => {
  const socket = net.connect();
  const transcoder = new Transcoder({stream: socket});

  t.truthy(transcoder instanceof Transcoder);
});

test('Encodes correctly', (t) => {
  return new Promise((res, rej) => {
    const {mitm, encoder, decoder} = t.context;

    mitm.on('connection', (socket) => {
      socket.on('data', (data) => {
        t.is(data.toString(), encoded);
        res();
      })
    });

    const socket = net.connect();

    const transcoder = new Transcoder({
      stream: socket,
      encoder: encoder,
      decoder: decoder
    });

    transcoder.write(decoded);
  });
});

test('Decodes correctly', (t) => {
  return new Promise((res, rej) => {
    const {mitm, encoder, decoder} = t.context;

    mitm.on('connection', (socket) => {
      socket.write(encoded);
    });

    const socket = net.connect();

    const transcoder = new Transcoder({
      stream: socket,
      encoder: encoder,
      decoder: decoder
    });

    transcoder.on('data', (data) => {
      t.deepEqual(data, decoded);
      res();
    });
  });
});

test('Transcodes correctly', (t) => {
  return new Promise((res, rej) => {
    const {mitm, encoder, decoder} = t.context;

    mitm.on('connection', (socket) => {
      const transcoder = new Transcoder({
        stream: socket,
        encoder: encoder,
        decoder: decoder
      });
      transcoder.write(decoded);
    });

    const socket = net.connect();

    const transcoder = new Transcoder({
      stream: socket,
      encoder: encoder,
      decoder: decoder
    });

    transcoder.on('data', (data) => {
      t.deepEqual(data, decoded);
      res();
    });

    transcoder.write(decoded);
  });
});
