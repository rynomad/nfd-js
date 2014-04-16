var ndn = require("ndn-lib");


var onInterest = function(prefix, interest, transport) {
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

var ndnx = {}

ndnx.init = require('./node/ndnx-init.js') //aliased for browser/node versions



module.exports = ndnx
