var ndn         = require('ndn-lib')
  , levelup     = require('levelup')
  , sublevel    = require('level-sublevel')
  , memDown     = require('memdown')

var FIB = {}

levelup('FIB', {db: memDown, valueEncoding: 'json'}, function (err, db) {

  // set up our LevelUP instance
  db = sublevel(db)


  FIB.db = db

})



FIB.put = function(forwardingEntry) {

  var FIBlevel = FIB.db.sublevel(forwardingEntry.name.toUri())

    var nexthopEntry = {
      faceID: forwardingEntry.nextHop.faceID,
      cost: forwardingEntry.nextHop.cost
    }
    FIBlevel.put(nexthopEntry.faceID, nexthopEntry, function onSuccess(id){
      console.log('put FIBEntry at id: ', id)
    }, function onError(err){
      console.log('error inserting FIBEntry : ', FIBEntry, err)
    })
}

FIB.lookupByName = function(name, onMatches) {
  var prefixes = [];

  function getAllPrefixes(name){
    var prefix = name.getPrefix(-1)
    prefixes.push(prefix.toUri())
    if (prefix.components.length > 0) {
      getAllPrefixes(prefix)
    }
  }

  var keyRanges = [];

  getAllPrefixes(name)
  
  for (var i = 0; i < prefixes.length; i++ ){
    console.log(prefixes[i])
    var matches = []
    var FIBlevel = FIB.db.sublevel(prefixes[i])
            .createReadStream()
            .on('data', function (data) {
               console.log(data.key, '=', data.value)
               matches.push(data.value)
            })
            .on('error', function (err) {
              console.log('Oh my!', err)
            })
            .on('close', function () {
              console.log('Stream closed')
            })
            .on('end', function () {
              onMatches(matches)
              console.log('Stream closed')
            })
  }

}


module.exports = FIB
