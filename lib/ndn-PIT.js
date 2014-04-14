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

PIT.put = function(face, interestObj, interestBytes, forward){

  if (interestObj.publisherPublicKeyDigest) {
    var pubKeyDig = interestObj.publisherPublicKeyDigest.toString('hex')
  }
  var PITEntry = {
    nonce: interestObj.nonce.toString(),
    faceID: face.id,
    publisherPublicKeyDigest: pubKeyDig || 'any',
    uri: interestObj.name.toUri(),
    encodedInterest: interestBytes
  }

  PIT.db.put(PITEntry.nonce, PITEntry, {ttl: interestObj.interestLifetimeMilliseconds}, function onSuccess(nonce){
    forward(face, interestBytes, interestObj)
    console.log(interestObj.interestLifetime, nonce, PITEntry, interestObj)
  }, function onError(err){
    console.log('error inserting PITEntry', PITEntry, err)
  })



}

PIT.lookupData = function(data, callb) {
  console.log('got data, looking up in PIT', data)
  var pubKey = data.signedInfo.publisher.publisherPublicKeyDigest.toString('hex')
  var prefixes = [];


 

  function getPITEntries (prefixes) {
  var sendFaces = []
  for (var i = 0; i < prefixes.length; i++) {
    

  
  PIT.db.createIndexedStream('uri', prefixes[i])
  .on('data', function (PI) {
    var inst = new ndn.Interest()
    inst.wireDecode(PI.encodedInterest)
    if ((inst.matchesName(data.name) && (PI.publisherPublicKeyDigest == ('any' || pubKey))) {
      PIT.db.del(PI.key)
      if (sendFaces[PI.faceID] == undefined) {
        sendFaces[PI.faceID] = true
        callb(PI.faceID)
      } 
    }
    // this will be called twice, and data will equal:
    // { key: 'foo2', value: '{"two":"TWO","key":"2","boom":"bam!"}' }
    // { key: 'foo3', value: '{"three":"THREE","key":"3","boom":"bam!"}' }
  })
  .on('error', function () {
    // ...
  })
  .on('end', function () {
    // ...
  })

  }


  }
  getAllPrefixes(data.name, getPITEntries)

}


module.exports = PIT;
