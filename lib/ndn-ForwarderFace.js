var ndn = require('ndn-lib');
var  = require('ndn-utils')
ndn.FIB = require("./ndn-FIB.js")
ndn.PIT = require("./ndn-PIT.js")

var Cache = require('./ndn-cache.js')
var TlvDecoder = ndn.TlvDecoder;
var NDNProtocolDTags = ndn.NDNProtocolDTags;
var Interest = ndn.Interest;
var Data = ndn.Data;
var ndnbuf = ndn.ndnbuf;
var Face = ndn.Face;
var Closure = ndn.Closure;
var UpcallInfo = ndn.UpcallInfo;
var Name = ndn.Name;
var LOG = require('./LOG.js')
var strategy = require('./ndn-strategy.js')


ndn.Faces = require('./ndn-Faces.js')

process.nextTick = require('./worker-process.js').nextTick

var PitEntry = function PitEntry(interest, face)
{
  this.interest = interest;
  this.face = face;
}

var ForwarderFace = function ForwarderFace(opts)
{
  var face = new ndn.Face(opts);
  face.id = ndn.Faces.length
  ndn.Faces.push(face)
  face.forwardingInterestHandler = function (element, interest, transport){
    if (LOG > 3) console.log("Interest packet received: " + interest.name.toUri() + "\n");

      if (LOG > 3) console.log('Interest packet received.');


      //window.interest = interest
      //console.log(interest)
      // Add to the PIT.
      /*for (var i = 0; i < ndn.PIT.length; i++) {
        //console.log(PIT[i].interest.nonce)
        if (ndn.PIT[i].interest.nonce.toString() == interest.nonce.toString()) {
          return;
        };
      };*/
      function onCacheHit(element, transport){
        console.log('cache hit')
        transport.send(element)
      }

      function onCacheMiss(element, interest){
        ndn.PIT.put(face.id, interest, element, strategy.forwardInterest);
      }
      Cache.check(interest, element, transport, onCacheHit, onCacheMiss)


  }
  face.onReceivedElement = function(element)
  {
    console.log("got element in forwarderFace ", this)
    var decoder = new TlvDecoder (element);
    if (decoder.peekType(Tlv.Interest, element.length)) {
      interest = new Interest();
      interest.wireDecode(element);
      this.forwardingInterestHandler(element, interest, this.transport)
    }
    else if (decoder.peekType(Tlv.Data, element.length)) {
      data = new Data();
      data.wireDecode(element);
      function onMatch (faceID) {
        Cache.data(data, element, function(){})
        ndn.Faces[faceID].transport.send(element)
      }
      ndn.PIT.lookupData(data, onMatch)

    }


  };


  face.selfReg = function (prefix) {
    if (this.registeredPrefixes == undefined) {
      this.registeredPrefixes = [];
    };
    if (prefix instanceof ndn.Name) {
      this.registeredPrefixes.push(prefix)
    } else if (typeof prefix == "string") {
      this.registeredPrefixes.push(new ndn.Name(prefix))
    }

  };
  var thisFace = face
  return face;
};


module.exports = ForwarderFace
