var ndn         = require('ndn-lib')
  , levelup     = require('levelup')
  , sublevel    = require('level-sublevel')
  , memDown     = require('memdown')
  , ttl         = require('level-ttl')

var PIT = {}

levelup('PIT', {db: memDown, valueEncoding: 'json'}, function (err, db) {

  // set up our LevelUP instance
  db = ttl(sublevel(db))
  PIT.db = db


  // ... use the database
})

PIT.put = function(fID, interestObj, interestBytes, forward){
  if (interestObj.publisherPublicKeyDigest != null) {
    var pubKeyDig = interestObj.publisherPublicKeyDigest.toString('hex')
  }
  var PITEntry = {
    nonce: interestObj.nonce.toString('hex'),
    faceID: fID.toString(),
    publisherPublicKeyDigest: pubKeyDig || 'any',
    uri: interestObj.name.toUri(),
    encodedInterest: interestBytes.toString('hex')
  }
  //console.log("about to put in PIT", PITEntry)
  PIT.db.sublevel(PITEntry.uri).put(PITEntry.nonce, PITEntry, {ttl: interestObj.interestLifetimeMilliseconds}, function onSuccess(nonce){
    forward(fID, interestBytes, interestObj)
    //console.log('PITEntry inserted', PITEntry.nonce)
  }, function onError(err){
    console.log('error inserting PITEntry', PITEntry, err)
  })



}

PIT.lookupData = function(data, callb) {
  //console.log('got data, looking up in PIT', data.name.toUri())
  var pubKey = data.signedInfo.publisher.publisherPublicKeyDigest.toString('hex')
  var prefixes = [data.name.toUri()];


  var matched = false
  var sendFaces =[]
  var keysToDelete = []
  function getPITEntries (name) {
    //console.log()
    if (PIT.db.sublevels[name.toUri()]){
      //console.log('sublevel exists for ', name.toUri())
      PIT.db.sublevel(name.toUri()).createReadStream()
      .on('data', function (PI) {
        //console.log('got result for', name.toUri())
        var inst = new ndn.Interest()
        inst.wireDecode(ndn.DataUtils.toNumbers(PI.value.encodedInterest))
        if (inst.matchesName(data.name) && (PI.value.publisherPublicKeyDigest == ('any' || pubKey))) {
          matched = true
          console.log('inst matches name')
          keysToDelete.push(PI.key)
          if (sendFaces[PI.value.faceID] == undefined) {
            sendFaces[PI.value.faceID] = true
            callb(PI.value.faceID)
          }
        }
      })
      .on('error', function (err) {
        //console.log("indexeStream err'", err.toString())
      })
      .on('end', function () {
        if (name.components.length <= 1)
        {
          //console.log('callingback null')
          callb(null);
        }

        else {
          if (keysToDelete.length > 0){
            for (var i = 0; i < keysToDelete.length; i++){
              PIT.db.sublevel(name.toUri()).del(keysToDelete[i])
            }
          }
          getPITEntries(name.getPrefix(-1))
        }
      })

    } else if (name.components.length > 0) {
      getPITEntries(name.getPrefix(-1))
    } else if (name.components.length == 0){
      //console.log('callingback null outs')
      callb(null)
    }

  }
  getPITEntries(data.name)
}


module.exports = PIT;
