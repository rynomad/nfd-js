var ndn = require('ndn-lib'),
    utils = require('ndn-utils'),
    FIB = require('./ndn-FIB.js'),
    management = require('./management.js')
    strategy = {};
ndn.Faces = require('./ndn-Faces.js')
strategy.forwardInterest = function(thisFace, element, interest) {
  //console.log('strategy forwarding interest', element)
  // Send the interest to the matching faces in the FIB.


  //onsole.log(thisFace, "sent me this")
  function forward(nextHopEntries) {

    //console.log('got nextHops from FIB', nextHopEntries, ndn.Faces)
    if (nextHopEntries.length > 0){
      var sent = []
      for (var i = 0; i < nextHopEntries.length; i++){
        var faceID = nextHopEntries[i].faceID
        if ((sent[faceID] == undefined) &&(faceID != thisFace)) {
          ndn.Faces[faceID].transport.send(interest.wireEncode().buffer)
          sent[faceID] = true
        }
      }
    }
  }

  ndn.FIB.lookupByName(interest.name, forward)

}



module.exports = strategy
