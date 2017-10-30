const test = require('ava');
const Message = require('../../packages/message');
const {PUB, SUB, REQ, RES, DIR, QUE, SRV} = Message.schemes;

test('Doesn\'t allow invalid schemas', t => {
  t.throws(() => new Message('FALSE', {}, {}));
  t.throws(() => new Message(1234567, {}, {}));
  t.notThrows(() => new Message(SRV));
});


test('PUB scheme requires correct headers', t => {
  t.throws(() => new Message(PUB, {src: 'foo'}, {}));
  t.throws(() => new Message(PUB, {tag: 'bar'}, {}));
  t.notThrows(() => new Message(PUB, {src: 'foo', tag: 'bar'}, {}));
});

test('PUB scheme denies reserved headers', t => {
  t.throws(() => new Message(PUB, {id: 'foo'}, {}));
});

test('SUB scheme requires correct headers', t => {
  t.throws(() => new Message(SUB, {src: 'foo'}, {}));
  t.throws(() => new Message(SUB, {tag: 'bar'}, {}));
  t.notThrows(() => new Message(SUB, {src: 'foo', tag: 'bar'}, {}));
});

test('SUB scheme denies reserved headers', t => {
  t.throws(() => new Message(SUB, {id: 'foo'}, {}));
});


test('REQ scheme requires correct headers', t => {
  t.throws(() => new Message(REQ, {src: 'foo'}, {}));
  t.throws(() => new Message(REQ, {uri: 'bar'}, {}));
  t.notThrows(() => new Message(REQ, {src: 'foo', uri: 'bar'}, {}));
});

test('REQ scheme denies reserved headers', t => {
  t.throws(() => new Message(REQ, {id: 'foo'}, {}));
});


test('RES scheme requires correct headers', t => {
  t.throws(() => new Message(RES, {src: 'foo'}, {}));
  t.throws(() => new Message(RES, {res: 'bar'}, {}));
  t.notThrows(() => new Message(RES, {src: 'foo', res: 'bar'}, {}));
});

test('RES scheme denies reserved headers', t => {
  t.throws(() => new Message(RES, {id: 'foo'}, {}));
});


test('DIR scheme requires correct headers', t => {
  t.throws(() => new Message(DIR, {src: 'foo'}, {}));
  t.throws(() => new Message(DIR, {tgt: 'bar'}, {}));
  t.notThrows(() => new Message(DIR, {src: 'foo', tgt: 'bar'}, {}));
});

test('DIR scheme denies reserved headers', t => {
  t.throws(() => new Message(DIR, {id: 'foo'}, {}));
});


test('QUE scheme requires correct headers', t => {
  t.throws(() => new Message(QUE, {}, {}));
  t.notThrows(() => new Message(QUE, {src: 'foo'}, {}));
});

test('QUE scheme denies reserved headers', t => {
  t.throws(() => new Message(QUE, {id: 'foo'}, {}));
});


test('SRV scheme requires correct headers', t => {
  t.notThrows(() => new Message(SRV, {}, {}));
});

test('SRV scheme denies reserved headers', t => {
  t.throws(() => new Message(SRV, {id: 'foo'}, {}));
});


test('Accessors get and set correct values', t => {
  const headers = {src: 'source', tag: 'tag'};
  let m = new Message(PUB, headers, 'body');

  t.is(m.scheme, PUB);
  t.is(m.data, m._data);
  t.is(m.headers.src, headers.src);
  t.is(m.headers.tag, headers.tag);
  t.is(m.body, 'body');

  t.throws(() => m.data = `Can't set data`);
  t.throws(() => m.scheme = `Can't set scheme`);
  t.throws(() => m.headers = `Can't set header object`);

  m.body = `Can set the body object`;
  t.is(m.body, `Can set the body object`);
});

test('Message.fromData works', t => {
  const m1 = new Message(PUB, {src: 'source', tag: 'tag'}, 'body');
  const m2 = Message.fromData(m1.data);
  t.deepEqual(m1, m2);
});
