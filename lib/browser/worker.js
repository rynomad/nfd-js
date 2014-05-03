var ndn = require('ndn-lib')
  , messageChannelTransport = require('ndn-messageChannelTransport')
  , telehashTransport = require('ndn-telehashTransport')
  , managment
  , ndnx = require('../ndnx.js')
  , Faces  = require('../ndn-Faces.js')
  , forwarderFace = require("../ndn-ForwarderFace.js")
  , BrowserKey = require("Browser-key")


self.onmessage = function(e) {

  if (e.data.ports){

    var face = new forwarderFace({  getTransport: function(){return new tcpServerTransport(c)}
                                  , onclose: function(){console.log("onclose triggered for TCPServertransport"); Faces[face.id] = false}})
    face.transport.connect(face, function(){console.log("new tcp face connected on server")})
  }

}
module.exports = function(callback){
  init(function(err){
    console.log('triggered callback')
    TCPserver = net.createServer(function(c){
      //console.log("new incoming connection!",c)
    })
    TCPserver.listen(6464, function(){
      console.log("server up")
      ndnx.init({
        id: ndn.globalKeyManager.getKey().publicKeyDigest

      }, function(){
        console.log("ndnx inited")
        callback()

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
