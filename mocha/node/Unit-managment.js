var Face = require('../../lib/ndn-ForwarderFace.js')
  , ndn = require('ndn-lib')
  , fa = new Face()

fa.close = function(){
  global.done()
}
describe("managment Interface", function(){

  it("should accept trigger close action", function(done){
    global.done = done
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
  it('should accept nextHop', function(done){
    global.done = done
    var param = {
      uri: "some/test",
      nextHop: {
        faceID: 0,
        cost: 1
      }
    } , nfblob = new ndn.Data(new ndn.Name(''), new ndn.SignedInfo(), JSON.stringify(param))
    nfblob.signedInfo.setFields()
    nfblob.sign()

    encodedBlob = nfblob.wireEncode()

    var name = new ndn.Name('localhost/nfd/fib/add-nexthop')
    name.append(encodedBlob)
    var interest = new ndn.Interest(name)
    fa.transport.send = function(element){
      if (element =="done")
        done()
    }

    fa.onReceivedElement(interest.wireEncode().buffer)

  })


})
