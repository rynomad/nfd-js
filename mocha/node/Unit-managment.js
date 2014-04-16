var Face = require('../../lib/ndn-ForwarderFace.js')
  , ndn = require('ndn-lib')
  , fa = new Face()

describe("managment Interface", function(){

  it("should accept trigger close action", function(){
    var param = {
      faceID: 0
    }
      , nfblob = new ndn.Data(new ndn.Name(''), new ndn.SignedInfo(), JSON.stringify(param))
    nfblob.signedInfo.setFields()
    nfblob.sign()
    
    encodedBlob = nfblob.wireEncode()

    var name = new ndn.Name('localhost/nfd/faces/destroy')
    name.append(encodedBlob)
    var interest = new ndn.Interest(name)
 
    fa.onReceivedElement(interest.wireEncode().buffer)

  })



})
