var ndn         = require('ndn-lib')
  , levelup     = require('levelup')
  , sublevel    = require('level-sublevel')
  , memDown     = require('memdown')

var FIB = {}

levelup('FIB', {db: memDown, valueEncoding: 'json'}, function (err, db) {

  // set up our LevelUP instance
  dab = sublevel(db)


  FIB.db = dab

})



FIB.put = function(forwardingEntry) {

  var FIBlevel = FIB.db.sublevel(forwardingEntry.name.toUri())

    var nexthopEntry = {
      faceID: forwardingEntry.nextHop.faceID,
      cost: forwardingEntry.nextHop.cost
    }
    FIBlevel.put(nexthopEntry.faceID, nexthopEntry, function onSuccess(id){
      console.log('put FIBEntry at id: ', nexthopEntry.faceID)
    }, function onError(err){
      console.log('error inserting FIBEntry : ', FIBEntry, err)
    })
}

FIB.lookupByName = function(name, onMatches) {
  
  function recursiveGet (name){
    var prefix = name.toUri()
    var matches = []
    var FIBlevel = FIB.db.sublevel(prefix)
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
              if (matches.length > 0)
                 onMatches(matches)
              if (name.components.length > 1) {
                recursiveGet(name.getPrefix(-1))
              }
                   
             console.log('Stream closed')
            })
  }

  recursiveGet(name)
}


module.exports = FIB
