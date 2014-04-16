var ndn = require("ndn-lib");
  , ndnx = {}

ndnx.onInterest = function(prefix, interest, transport) {
  //This handler is for handling connection and fib requests from remote peers/clients TODO: add authentication mechanisms
  console.log("got intersest in ndnx system namespace", prefix, interest, transport);
  var module  = interest.name.components[2].toEscapedString()
    , verb    = interest.name.components[3].toEscapedString()
    , nfblob  = interest.name.components[4].getValue()
    , d  = new ndn.Data();

  d.wireDecode(nfblob)
  
  var newParamData = new ndn.Data(d.name, new ndn.SignedInfo(), d.content)
    , newName = new ndn.Name('localhost/nfd/' + module + '/' + verb)
  
  newParamData.signedInfo.setFields()
  newParamData.sign()
  var enc = newParamData.wireEncode()

  newName.append(enc)

  transport.send(enc.buffer)
};


ndnx.init = function(opts){
  ndnx.face = new ndn.Face({host: 'localhost', port: opts.port || 6464 , getTransport: opts.getTransport, onopen: function(){

    var param = {
      uri: "ndnx/" + opts.id.toString('hex'),
      nextHop: {
        faceID: 0,
        cost: 0
      }
    } , nodeblob = new ndn.Data(new ndn.Name(''), new ndn.SignedInfo(), JSON.stringify(param))
    nodeblob.signedInfo.setFields()
    nodeblob.sign()

    encodedNodeBlob = nfblob.wireEncode()

    var nodeName = new ndn.Name('localhost/nfd/fib/add-nexthop')

    nodeName.append(encodedBlob)
    var interest = new ndn.Interest(name)
    self.face.expressInterest(name)
    self.face.transport.connect(self.face, function(){
      var closure = new ndn.Face.CallbackClosure(null, null, ndnx.onInterest, param.uri, self.face.transport)
      ndn.Face.registeredPrefixTable.push(new RegisteredPrefix(param.uri, closure))
    })
  }})
}



module.exports = ndnx
