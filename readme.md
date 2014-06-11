NDN-Forwarder
====

NDN-Forwarder is a javascript [Named Data Networking](http://named-data.net) forwarding daemon for node and the browser (via browserify). Whereas the principle NFD daemon is geared towards infrastructure routing and lends itself to deployment on a per-device basis, this project is aimed towards experimenting with ad-hoc overlay NDN networks for federated apps and services, with an API that lends itself to being included as a routing module within packaged and web applications. This forwarder is built upon [NDN-js](http://github.com/named-data/ndn-js) and uses NDN-tlv wire format.

In addition, while tcp and websocket connections are supported, the forwarder includes and prefers the javascript implimentation of [telehash](http://telehash.org) for it's encryption and NAT punching abilities.


Warning: Here Be Dragons
--------

This module is in an early alpha stage of development, and while suitable for experimentation and prototyping, should not *yet* be used in production code. Pull requests and bug reports are welcome.

Initialization and API
---

Once initialized, the forwarder listens for managment commands in the "/localhost" namespace, using specially formatted interest messages to manage connections and FIB entries. For a programatic API, use [ndn-io](http://github.com/rynomad/ndn-io). For data storage and publishing, use [level-ndn](http://github.com/rynomad/level-ndn).

Example

```
var ndnInit = require("ndn-forwarder")
  , io = require("ndn")
  , repo = require("level-ndn")
  , IOoptions = {
    transport: 'websocket' // 'tcp' in node
    host: 'localhost'
    port: 6565 // 6464 for tcp
  }
  , namespace = "your/application/namespace"

function forwarderCallback(self){
  // self == telehash self object

  repo.tangle(namespace, null, null, repoTangleCallback)
  //the 'null' arguments here are for future versions where we allow for various transports to connect with the nfd

}

function repoTangleCallback(){
  repo.init(namespace, repoInitCallback, firstcb)
  //repoInitCallback = a callback executed every time the repo is initialized
  //firstcb = a callback executed the first time the repo is initialized on a machine, useful for importing/migrating data.
}

function repoInitCallback(){
  io.remoteTangle(IOoptions, appBegin)
}

function appBegin(){
  //your forwarder, repository, and io module are all ready to go!
}

ndnInit(forwarderCallback)

```
