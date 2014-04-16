var PIT = require('../../lib/ndn-PIT.js')
  , ndn = require('ndn-lib')
    var data = new ndn.Data(new ndn.Name('test/pit/matching'), new ndn.SignedInfo(), 'success')
    data.signedInfo.setFields()
    data.sign()
describe('PIT', function(){
  it('should insert PITEntry', function(done){
    var inst = new ndn.Interest(new ndn.Name('test'))
    inst.setInterestLifetimeMilliseconds(1000)
    var enc = inst.wireEncode()

    var nonced = new ndn.Interest()
    nonced.wireDecode(enc)
    PIT.put(1, nonced, enc.buffer, function(){done()})
  })

  it('should return said PITEntry', function(done){
    PIT.lookupData(data, function(matches){
      if (matches != null)      
      done()
    })
  })
  it('should not return PITEntry after Timeout', function(done){
    setTimeout(function(){
   PIT.lookupData(data, function(matches){
      if (matches == null)
      done()
    })

    }, 1200)  

  })
})
