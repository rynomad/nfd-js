var Face = require('../ndn-ForwarderFace.js')
  , ndn = require('ndn-lib')

module.exports = function(requestingFaceID, name) {
  var nfblob = name.components[4].getValue()
  var d = new ndn.Data()
  d.wireDecode(nfblob)
  //d.verify()
  var parameters = JSON.parse(d.content.toString())
  console.log("got to face creator",parameters)
  if (parameters.protocol == "tcp") {
    console.log(Face)
    var face = new Face({host: parameters.host, port: parameters.port})
  } else {
    console.log("ignoring unsupported protocol")
  }

}

