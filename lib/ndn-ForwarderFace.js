var ndn = require('ndn-lib');
ndn.FIB = require("./ndn-FIB.js")
ndn.PIT = require("./ndn-PIT.js")
ndn.Faces = require('./ndn-Faces.js')
var Cache = require('ndn-cache')
var management = require("./management.js")
var TlvDecoder = ndn.TlvDecoder;
var Tlv = ndn.Tlv
var NDNProtocolDTags = ndn.NDNProtocolDTags;
var Interest = ndn.Interest;
var Data = ndn.Data;
var ndnbuf = ndn.ndnbuf;
var Face = ndn.Face;
var Closure = ndn.Closure;
var UpcallInfo = ndn.UpcallInfo;
var Name = ndn.Name;
var strategy = require('./ndn-strategy.js')



ndn.Faces = require('./ndn-Faces.js')


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
  var self = face
  face.forwardingInterestHandler = function (element, interest, transport){
      console.log('forwardingInterestHandler')

      function forward (thisFace, element, interest) {
        if (interest.name.components[0].toEscapedString() == 'localhost') {
          // localhost command interest
          console.log('localhost interest')
          management(thisFace, interest.name)
        } else {
          strategy.forwardInterest(thisFace, element, interest)
        }
      }

      function onCacheHit(element, transport){
        console.log('cache hit')
        transport.send(element)
      }

      function onCacheMiss(element, interest){
        console.log('cache miss')
        ndn.PIT.put(self.id, interest, element, forward);
      }
      Cache.check(interest, element, transport, onCacheHit, onCacheMiss)


  }
  face.onReceivedElement = function(element)
  {
    console.log("got element in forwarderFace ")
    var decoder = new TlvDecoder (element);
    if (decoder.peekType(Tlv.Interest, element.length)) {
      console.log('is interest')
      interest = new Interest();
      interest.wireDecode(element);
      this.forwardingInterestHandler(element, interest, this.transport)
    }
    else if (decoder.peekType(Tlv.Data, element.length)) {
      console.log('is data')
      data = new Data();
      data.wireDecode(element);
      var hasCached = false
      function onMatch (faceID) {
        if (faceID != null){
          //console.log('faceID', faceID, element)
          if (ndn.Faces[faceID]){
            ndn.Faces[faceID].transport.send(data.wireEncode().buffer)
          }
          if (hasCached == false) Cache.data(data, element, function(){hasCached = true})
        }

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

management.getConstructor(ForwarderFace)

module.exports = ForwarderFace
