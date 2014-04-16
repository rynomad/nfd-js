var ndn = require('ndn-lib'),
    utils = require('ndn-utils'),
    FIB = require('./ndn-FIB.js'),
    management = require('./management.js')
    strategy = {};
ndn.Faces = require('./ndn-Faces.js')

strategy.forwardInterest = function(thisFace, element, interest) {
  console.log('strategy forwarding interest')
  // Send the interest to the matching faces in the FIB.

  if (interest.name.components[0].toEscapedString() == 'localhost') {
    // localhost command interest
    console.log('localhost')
    management(thisFace, interest.name)    
  } else {
  //console.log(ndn.FIB)

  function forward(nextHopEntries) {
    console.log('got nextHops from FIB', nextHopEntries)
    if (nextHopEntries.length > 0){
      var sent = []
      for (var i = 0; i < nextHopEntries.length; i++){
        var faceID = nextHopEntries[i].faceID
        if (sent[faceID] == undefined) {
          ndn.Faces[faceID].transport.send(element)
          sent[faceID] = true
        }
      }
    }
  }

  ndn.FIB.lookupByName(interest.name, forward)
  }
}



module.exports = strategy
