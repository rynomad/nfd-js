var ndn         = require('ndn-lib')
  , levelup     = require('levelup')
  , sublevel    = require('level-sublevel')
  , memDown     = require('memdown')
  , faces       = require("./ndn-Faces.js")

var FIB = {}

levelup('FIB', {db: memDown, valueEncoding: 'json'}, function (err, db) {

  // set up our LevelUP instance
  dab = sublevel(db)


  FIB.db = dab

})



FIB.put = function(forwardingEntry, cb) {

  var FIBlevel = FIB.db.sublevel(forwardingEntry.name.toUri())

    var nexthopEntry = {
      faceID: forwardingEntry.nextHop.faceID,
      cost: forwardingEntry.nextHop.cost
    }
    if (faces[nexthopEntry.faceID]){
      FIBlevel.put(nexthopEntry.faceID, nexthopEntry, function onSuccess(id){
        console.log('put FIBEntry', forwardingEntry.name.toUri(), ' at id: ', nexthopEntry.faceID)
        cb()
      }, function onError(err){
        console.log('error inserting FIBEntry : ', FIBEntry, err)
      })
    } else {
      console.log('no face at ID ', nexthopEntry.faceID)
    }

}

FIB.lookupByName = function(name, onMatches) {

  function recursiveGet (name){
    var prefix = name.toUri()
    var matches = []
    var FIBlevel = FIB.db.sublevel(prefix)
                      .createReadStream()
                      .on('data', function (data) {
                        //console.log(data.key, '=', data.value)
                        if (faces[data.value.faceID]){
                          matches.push(data.value)
                        } else {
                          FIB.db.sublevel(prefix).del(data.key)
                        }

                      })
                      .on('error', function (err) {
                        console.log('Oh my!', err.toString())
                      })
                      .on('close', function () {
                        //console.log('Stream closed')
                      })
                      .on('end', function () {
                        if (matches.length > 0)
                          onMatches(matches)
                          if (name.components.length > 1) {
                            recursiveGet(name.getPrefix(-1))
                          }

                      })
    }

  recursiveGet(name)
}


module.exports = FIB
