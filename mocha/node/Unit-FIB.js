
var FIB = require('../../lib/ndn-FIB.js')
  , ndn = require('ndn-lib')

describe('PIT', function(){
  it('should insert FIBEntry', function(){
    var FIBEntry = {
      name : new ndn.Name('some/four/segment/name'),
      nextHop: {
        faceID: 1,
        cost: 0
      }
    }
    FIB.put(FIBEntry)
  })

  it('match against said FIBEntry', function(done){
    FIB.lookupByName(new ndn.Name('some/four/segment/name/interest'), function(matches){
      console.log('onmatches called with ', matches)
      done()
    })
  })

})
