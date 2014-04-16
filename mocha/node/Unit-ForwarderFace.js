var ndn = require('ndn-lib')
var FIB = require('../../lib/ndn-FIB.js')
var PIT = require('../../lib/ndn-PIT.js')
var forface = require('../../lib/ndn-ForwarderFace.js')
var net = require('net')
var sockTransport = require('../../../tcpServerTransport/tcpServerTransport.js').serverTcpTransport

var serv = net.createServer(function(c){

  var i = {}
  i.trans = new sockTransport(c)
  global.face1 = new forface({host:1, port:1, getTransport: function(){return i.trans}})
  face1.transport.send = function(el){
    console.log(this.transport)
    var d = new ndn.Data(new ndn.Name('test/long/match'), new ndn.SignedInfo(), 'success')
    d.signedInfo.setFields()
    d.sign()
    var enc = d.wireEncode()
    face1.onReceivedElement(enc.buffer)
  }
  console.log('face1',face1.id)
})

serv.listen(6464, function(){
  console.log('server')
})


var face0 = new forface({host:'localhost', port: 6464})
console.log('face0',face0.id)
face0.transport.connect(face0, function(){console.log('face0 connected')})
var testForwardingEntry = {
  name: new ndn.Name('test'),
  nextHop: {
    faceID: 1,
    cost: 0
  }  
}

setTimeout(function(){FIB.put(testForwardingEntry)},200)


describe('forwarding', function(){
  it('face0 interest should respond with data through forwarder from face1', function(done){
    setTimeout(function(){
    var inst = new ndn.Interest(new ndn.Name('test/long'))
    inst.setInterestLifetimeMilliseconds(1000)
    var enc = inst.wireEncode()
    face0.onReceivedElement(enc.buffer)
    face0.transport.send = function(el){

      var d = new ndn.Data()
      d.wireDecode(el)
      if ( d.content.toString() == 'success') done()
     }
    }, 500)
  })
})
