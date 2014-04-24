var ndn         = require('ndn-lib')
  , levelup     = require('levelup')
  , mappedIndex = require('level-mapped-index')
  , sublevel    = require('level-sublevel')
  , memDown     = require('memdown')
  , ttl         = require('level-ttl')

var PIT = {}

levelup('PIT', {db: memDown, valueEncoding: 'json'}, function (err, db) {

  // set up our LevelUP instance
  db = ttl(sublevel(db))
  db = mappedIndex(db)
  PIT.db = db
  // register 2 indexes:

  // first index is named 'id' and indexes the 'id' property
  // of each entry
  db.registerIndex('faceID', function (key, value, emit) {
    //console.log("is this my rogue?",value)
    if (value.faceID) emit(value.faceID)
  })

  // second index is named 'bleh' and indexes the 'bleh' property
  db.registerIndex('uri', function (key, value, emit) {
    if (value.uri) emit(value.uri)
  })

  db.registerIndex('publisherPublicKeyDigest', function(key, value, emit){
    if (value.publisherPublicKeyDigest) emit (value.publisherPublicKeyDigest)
  })


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
  console.log("about to put in PIT")
  PIT.db.put(PITEntry.nonce, PITEntry, {ttl: interestObj.interestLifetimeMilliseconds}, function onSuccess(nonce){
    forward(fID, interestBytes, interestObj)
  }, function onError(err){
    console.log('error inserting PITEntry', PITEntry, err)
  })



}

PIT.lookupData = function(data, callb) {
  console.log('got data, looking up in PIT', data.name.toUri())
  var pubKey = data.signedInfo.publisher.publisherPublicKeyDigest.toString('hex')
  var prefixes = [data.name.toUri()];

  function getAllPrefixes(name, cb){
    var prefix = name.getPrefix(-1)
    prefixes.push(prefix.toUri())
    if (prefix.components.length > 0) {
      getAllPrefixes(prefix, cb)
    } else{cb(prefixes)}
  }

  var matched = false
  var sendFaces =[]
  function getPITEntries (name) {
      console.log(name.toUri())
      PIT.db.createIndexedStream('uri', name.toUri())
         .on('data', function (PI) {

            var inst = new ndn.Interest()
            inst.wireDecode(ndn.DataUtils.toNumbers(PI.value.encodedInterest))
            if (inst.matchesName(data.name) && (PI.value.publisherPublicKeyDigest == ('any' || pubKey))) {
              matched = true
              console.log('inst matches name')
              PIT.db.del(PI.key)
              if (sendFaces[PI.value.faceID] == undefined) {
                sendFaces[PI.value.faceID] = true
                callb(PI.value.faceID)
              }
            }
         })
         .on('error', function (err) {
           console.log("indexeStream err'", err)
         })
         .on('end', function () {
           if (name.components.length <= 1)
             {callb(null);}
           else {
             getPITEntries(name.getPrefix(-1))
           }
         })

  }
  getPITEntries(data.name)
}


module.exports = PIT;
