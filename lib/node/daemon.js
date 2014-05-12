console.log(process.env.HOME)
var ndn = require('ndn-lib')
  , tcpServerTransport = require('ndn-tcp-server-transport')
  , webSocketServerTransport = require("ndn-websocket-server-transport")
  , telehashTransport = require("ndn-telehash-transport")
  , managment
  , ndnx = require('../ndnx.js')
  , Faces  = require('../ndn-Faces.js')
  , forwarderFace = require("../ndn-ForwarderFace.js")
  , down = require('leveldown')
  , path = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
  , levelup = require('levelup')
  , net = require('net')
  , ws = require("ws")
  , init = function init(callback){
    levelup(path + "/.nfd", {db: down},function(err, db){
      //console.log(err.toString(), db)
      db.get('public', function(err, value){
        if (err) {
          if (err.notFound) {
            var pki = require('node-forge').pki
            pki.rsa.generateKeyPair({bits: 2048}, function(er, keys){
              var cert = pki.createCertificate();
              cert.publicKey = keys.publicKey;
              cert.serialNumber = '01';
              cert.validity.notBefore = new Date();
              cert.validity.notAfter = new Date();
              cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
              cert.sign(keys.privateKey);
              var pem = pki.certificateToPem(cert);
              var pubPem = pki.publicKeyToPem(keys.publicKey);
              var priOpenPem = pki.privateKeyToPem(keys.privateKey);
              ndn.globalKeyManager.certificate = pem;
              ndn.globalKeyManager.publicKey   = pubPem
              ndn.globalKeyManager.privateKey  = priOpenPem;
              ndn.globalKeyManager.key = null
              var ops = [
                { type: 'put', key: 'public', value: pubPem }
                , { type: 'put', key: 'private', value: priOpenPem }
                , { type: 'put', key: 'certificate', value: pem }
              ]
              db.batch(ops, function(err){
                console.log('batch finished')
                if (!err) callback()
                  })
            })
          } else{
            // I/O or other error, pass it up the callback chain
            console.log("IO err", err)
            return callback(err)}
        } else {
          ndn.globalKeyManager.publicKey = value;
          db.get('private', function(err, value){
            ndn.globalKeyManager.privateKey = value;
            db.get('certificate', function(err, value){
              ndn.globalKeyManager.certificate = value;
              ndn.globalKeyManager.key = null
              callback()
            })
          })
        }
      })
    })
  }


module.exports = function(callback){
  init(function(err){
    if (err) return console.log('triggered callback with error in init')
    function thinit(cb){
      telehashTransport.start('nfd-th', function(self){
        console.log(self.hashname, " aba12fd25802c6efe091d33c323804929f08dde23bcf3650b8ce1eb5a50a5a88")
        cb()
        self.listen("ndn", function(err, packet, chan, callb){
          console.log(self.hashname)
          chan.send({js: packet.js})
          callb(true)
          var face = new forwarderFace( { host:111
                                         , port:111
                                         , getTransport: function(){return new telehashTransport.transport(chan.hashname, chan)}
                                         , onclose: function(){console.log("onclose triggered for telehashTransport"); Faces[face.id] = false}})

          face.transport.connect(face, function(){console.log("new telehash face connected on server")})
        });
      })
    }

    TCPserver = net.createServer(function(c){
      //console.log("new incoming connection!",c)
      var face = new forwarderFace({  getTransport: function(){return new tcpServerTransport(c)}
                                    , onclose: function(){console.log("onclose triggered for TCPServertransport"); Faces[face.id] = false}})
      face.transport.connect(face, function(){console.log("new tcp face connected on server")})
    })
    TCPserver.listen(6464, function(){
      console.log("server up")
      ndnx.init({
        id: ndn.globalKeyManager.getKey().publicKeyDigest

      }, function(){
        console.log("ndnx inited")
        thinit(callback)

      })
    })

    WSServer = new ws.Server({port: 6565})

    WSServer.on('connection', function(ws) {
      var trans = new webSocketServerTransport.transport(ws)
      var face = new forwarderFace({getTransport: function(){return trans}
                                    , onclose: function(){console.log("onclose triggered for webSocketServertransport"); Faces[face.id] = false}})
      face.transport.connect(face, function(){console.log("new websocket face connected on server")})

    });


  })
}
