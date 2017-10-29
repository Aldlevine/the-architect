# The Architect

A service registry and message broker system.


## Goals

These are the dreams.

- A service registry that acts as a proxy between services.
- A load balancing scheme for synchronous transport.
- A message queue for asynchronous transport.


## Parts and Pieces

This is the stuff that dreams are made of.


### service-registry

The service registry stores and retrieves services by both a service uri and a
service id.

When a service worker starts, it must make a tcp connection to the service
registry. After the registry receives the register request it assigns the
service an id and stores the service's information in a database. When a service
worker's connection is broken the registry removes it from the database based on
the service's id.

```
┌─────────────────────────────────────────────────╖
│ ┌──────────┐      ┌─────────┐      ┌──────────┐ ║
│ │ register │ ═══> │ service │ ═══> │ service  │ ║
│ │ service  │      └─────────┘      │ registry │ ║
│ └──────────┘                       │          │ ║
│                                    │          │ ║
│ ┌──────────┐      ┌─────────┐      │          │ ║
│ │ query    │ ═══> │ query   │ ═══> │          │ ║
│ │ service  │      └─────────┘      │          │ ║
│ │          │      ┌─────────┐      │          │ ║
│ │          │ <═══ │ service │ <═══ │          │ ║
│ └──────────┘      └─────────┘      └──────────┘ ║
╘═════════════════════════════════════════════════╝
```


### service

A service is a stub that contains information about it's workers in the service
registry. It provides the means of tracking and communicating with a worker or
groups of workers.


### worker

A single instance of a service. This typically translates to a single process,
however it is possible(though not advised) for multiple workers to run in one
process. As there is no specification for how workers should function, only a
messaging API, it is not necessary for a worker to use the provided `worker`
module in order to communicate. This helps in providing a simple and standard
interface for communicating and allows for the simple implementation of this
standard in any language. However using a standardized module is recommended to
ensure stabile and predictable communication.

When a worker's connection to the service registry is unexpectedly closed, while
it's not necessary, the worker should follow a reconnect policy such as:

- ondisconnect: {"retry", "exit", "ignore"}
- retries: {number}
- interval: {ms}


### worker-picker

The worker picker is a mechanism that retrieves a worker from a service
addressed by it's uri. The main purpose of this mechanism is to provide load
balancing to service requests. While there is no defined algorithm the "power of
two random choices" algorithm is an effective and simple load balancing
algorithm.

When the message broker needs to access a single worker from a service by the
service's uri, it requests this worker via the worker picker.


### message-broker

The message broker is the communication hub. It manages all incoming and
outgoing messages between services.

Once a service is registered, it's connection is piped to the message broker.
Once connected, a service can begin sending and receiving messages from other
services. The message broker identifies from the message headers the intended
recipient service(s) and delivers the message.

There are five primary messaging schemes: __PUB/SUB__, __REQ/RES__, __DIR__,
__QUE__, and  __SRV__.

1. __PUB/SUB__: _publish / subscribe_
  - This messaging scheme is intended for broadcasting messages to any service
    that requests these messages. An example might include "log" messages
    intended for a logging service to receive and write to a file. If a service
    subscribes to "log" messages, any "log" messages published by any service
    will be delivered to the subscribing service.
  - When a service registers for a subscription it recieves all matching
    messages sent by any other unique service. This can include messages from
    other services of the same type (unless specifically excluded by the
    criteria).
  - When a service publishes a message, the same message is sent to all services
    with a matching subscription.
2. __REQ/RES__: _request / response_
  - This messaging scheme is intended for typically synchronous and composable
    tasks.
  - When a service makes a request of either a unique service or service type, a
    request message is sent to the reciving service. Once the requested service
    finishes processing the request, it responds with another message that is
    delivered directly to the originla requesting service.
  - The message broker tracks the number of open requests for each worker.
3. __DIR__: _direct message_
  - This message scheme is a sort of half-bake REQ/RES scheme.
  - When a service sends a direct message to another service, it does so without
    expecting any response.
4. __QUE__: _registry query_
  - This is a message scheme that allows a worker to communicate directly with
    the service registry.
  - The purpose of this scheme is to provide a means of introspection into the
    service registry.
  - Examples of useful information that this scheme could provide are:
    - A list of the available services.
    - The number of open requests for each service.
    - The average execution time of requests for each service.
    - A list of subscribers and their message criteria.
5. __SRV__: _service registry connect signal_
  - This is a special message scheme that connects service registries together.
  - The purpose of this is to enable multiple replicas of the service registry
    to share access to services.


### message

A message is a packet of data sent between services. It consists of 3 pieces:
1. The message scheme
  - This can be equated to http methods
  - The available schemes are:
    - PUB
    - SUB
    - REQ
    - RES
    - DIR
2. The message headers
  - This can be equated to http headers.
  - While any arbitrary headers are allowed, there a certain headers reserved
    for standard communication:
    - __id__: The message id
    - __src__: The id of the source worker
    - __tgt__: The id of the target worker -- _only applicable to direct
      messages {DIR}_
    - __uri__: The uri of the target service -- _only applicable for
      subscriptions and service requests {REQ, SUB}_
    - __req__: The id of the request message that triggered a response -- _only
      applicable for service responses {RES}_
    - __tag__: The subscription tag for the pub/sub scheme. -- _only applicable
      for publish and subscribe messages {PUB, SUB}_
3. The message body
  - This can be equated to an http body


```
┌──────────────────────────────────────────────────╖
│ example publish message                          ║
│ {                                                ║
│   scheme: 'PUB',                                 ║
│   headers: {                                     ║
│     id: 'f2a7c7c1-8ddf-40c6-bd05-9dc6c8128678',  ║
│     src: '4faacdc9-bd31-410f-9a17-5e884d709f78', ║
│     tag: 'log.my-service'                        ║
│   },                                             ║
│   body: {                                        ║
│     level: 'error',                              ║
│     message: 'Something went wrong!',            ║
│     stack: 'And this is where it happened...'    ║
│   }                                              ║
│ }                                                ║
╘══════════════════════════════════════════════════╝
┌──────────────────────────────────────────────────╖
│ example subscribe message                        ║
│ {                                                ║
│   scheme: 'SUB',                                 ║
│   headers: {                                     ║
│     id: '362701ad-121d-49e9-b7b0-7eec8a12f6a7',  ║
│     src: 'b2ef6770-2fdb-4f5a-afce-6a1df455c418', ║
│     tag: 'log.*'                                 ║
│   },                                             ║
│   body: {                                        ║
│     level: {$in: ['warning', 'error']}           ║
│   }                                              ║
│ }                                                ║
╘══════════════════════════════════════════════════╝
┌──────────────────────────────────────────────────╖
│ example request message                          ║
│ {                                                ║
│   scheme: 'REQ',                                 ║
│   headers: {                                     ║
│     id: '1bd0567e-8150-4f6b-935c-3b9b8aa05ad4',  ║
│     src: '4faacdc9-bd31-410f-9a17-5e884d709f78', ║
│     uri: 'greeter/say-hello'                     ║
│   },                                             ║
│   body: {                                        ║
│     fname: 'Marl',                               ║
│     lname: 'Karx'                                ║
│   }                                              ║
│ }                                                ║
╘══════════════════════════════════════════════════╝
┌──────────────────────────────────────────────────╖
│ example response message                         ║
│ {                                                ║
│   scheme: 'RES',                                 ║
│   headers: {                                     ║
│     id: 'f9f6424d-1278-447e-95ba-da04206bde32',  ║
│     src: 'b2ef6770-2fdb-4f5a-afce-6a1df455c418', ║
│     req: '1bd0567e-8150-4f6b-935c-3b9b8aa05ad4', ║
│   },                                             ║
│   body: {                                        ║
│     greeting: 'Hello Mark Karx!'                 ║
│   }                                              ║
│ }                                                ║
╘══════════════════════════════════════════════════╝
┌──────────────────────────────────────────────────╖
│ example direct message                           ║
│ {                                                ║
│   headers: {                                     ║
│   scheme: 'DIR',                                 ║
│     id: '5b51247d-6401-4fa0-ad46-5543b82482b3',  ║
│     src: 'b2ef6770-2fdb-4f5a-afce-6a1df455c418', ║
│     tgt: '4faacdc9-bd31-410f-9a17-5e884d709f78', ║
│   },                                             ║
│   body: {                                        ║
│     body: {                                      ║
│       message: 'Here, take this',                ║
│       stuff: {}                                  ║
│     }                                            ║
│   }                                              ║
│ }                                                ║
╘══════════════════════════════════════════════════╝
```


## Help yourself

These things are left up to the designer to implement. _(Though, there may be
prefabs out there somewhere ;)_


### matcher

The matcher is a mechanism that determines if a given message meets the criteria
for a subscriber. It should match on the `tag` header and `body`, but can match
on any part of the message. A recommended implementation is to match the tag
against a glob pattern ([minimatch](https://github.com/isaacs/minimatch)) and
the body through [sift.js](https://github.com/crcn/sift.js).


```
┌───────────────────────────────────────────────────╖
│ ┌─────────┐     ┌─────────┐     ┌───────────────┐ ║
│ │ message │     │  true   │ ══> │ send message  │ ║
│ └─────────┘     └───╥─────┘     └───────────────┘ ║
│      ║              ║                   ║         ║
│      ║              ║                   V         ║
│      ║          ╔═══╩═════╗     ┌───────────────┐ ║
│      ╚════════> ║ matcher ║ <── │ subscription  │ ║
│                 ╚═══╤═════╝     └──────┐.┌──────┘ ║
│                     │           ┌──────┘.└──────┐ ║
│ ┌─────────┐     ┌───┴─────┐     │   . . . . .   │ ║
│ │ ignore  │ <── │  false  │     │ subscriptions │ ║
│ └─────────┘     └─────────┘     └───────────────┘ ║
╘═══════════════════════════════════════════════════╝

```


### transcoder

The transcoder is a duplex transform stream. On the front-end it reads and
writes objects. On the back-end it reads and writes buffers.

The purpose of this module is to simplify streaming encoded messages to and from
sockets and http requests/responses. However, it can be used as a bidirectional
transform for any duplex stream. While the message encoding system is not
defined, a good option that works well with this spec is
[msgpack](https://github.com/msgpack/msgpack).


```
┌────────────────────────────────────────────────────────╖
│   Front end                             Back end       ║
│ ┌──────────────┐      ┌────────┐      ┌──────────────┐ ║
│ │ write object │ ═══> │ encode │ ───> │ read buffer  │ ║
│ └──────────────┘      └────────┘      └──────────────┘ ║
│ ┌──────────────┐      ┌────────┐      ┌──────────────┐ ║
│ │ read object  │ <═══ │ decode │ <─── │ write buffer │ ║
│ └──────────────┘      └────────┘      └──────────────┘ ║
╘════════════════════════════════════════════════════════╝
```
