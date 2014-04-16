var ndn = require('ndn-lib'),
    utils = require('ndn-utils'),
    FIB = require('./ndn-FIB.js'),
    strategy = {};
ndn.Faces = require('./ndn-Faces.js')

strategy.forwardInterest = function(thisFace, element, interest) {

  // Send the interest to the matching faces in the FIB.
  var isLocalInterest = false;
  if (utils.nameHasCommandMarker(interest.name)) {
    if (utils.getCommandMarker(interest.name) == '%C1.M.S.localhost') {
      //console.log("interest has localhost commandMarker")
      isLocalInterest = true;
    }
  }
  //console.log(ndn.FIB)

  function forward(nextHopEntries) {
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



module.exports = strategy
