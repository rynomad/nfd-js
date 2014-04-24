var Face = require('../ndn-ForwarderFace.js')
  , Faces = require('../ndn-Faces.js')
  , ndn = require('ndn-lib')

module.exports = function(requestingFaceID, name) {
  var nfblob = name.components[4].getValue()
  var d = new ndn.Data()
  d.wireDecode(nfblob)
  //d.verify()
  var parameters = JSON.parse(d.content.toString())
  console.log(parameters)

}

