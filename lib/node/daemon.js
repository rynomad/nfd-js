console.log(process.env.HOME)
var ndn = require('ndn-lib')
  , tcpServerTransport = require('ndn-tcpServerTransport')
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
     // console.log(err, db)
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


init(function(err){
  console.log('triggered callback')
  server = net.createServer(function(c){
    //console.log("new incoming connection!",c)
    var face = new forwarderFace({getTransport: function(){return new tcpServerTransport(c)}})
    face.transport.connect(face, function(){console.log("new face connected on server")})
  })
  server.listen(6464, function(){
    console.log("server up")
    ndnx.init({
      id: ndn.globalKeyManager.getKey().publicKeyDigest

    }, function(){
      console.log("ndnx inited")

    })
  })


})
