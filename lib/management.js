var FIB = require('./ndn-FIB.js')
  , Face = require('./ndn-ForwarderFace.js')
  , Faces = require('./ndn-Faces.js')
  , ndn = require('ndn-lib')
var managment = function(requestingFaceID, name) {
  var module = name.components[2].toEscapedString()
  console.log(module)
  if (module == 'faces'){
    managment.faces(requestingFaceID, name)
  } else if (module == "fib"){
    managment.fib(requestingFaceID, name)
  } else if (module == "strategy-choice") {
    console.log('not implimented')
    //managment.strategy_choice(requestingFaceID, name)
  }
}

managment.faces = function (requestingFaceID, name) {
  var verb = name.components[3].toEscapedString()
  console.log(verb)
  if (verb == "create") {
    managment.faces.create(requestingFaceID, name)
  } else if (verb == "destroy") {
    managment.faces.destroy(requestingFaceID, name)
  } else if (verb == "enable-local-control") {
    console.log('not implimented')
    //managment.faces.enable_local_control(requestingFaceID, name)
  } else if (verb == "disable-local-control") {
    console.log('not implimented')
    //managment.faces.disable_local_control(requestingFaceID, name)
  }
}

managment.faces.create = require('./create-Faces.js')


managment.faces.destroy = function(requestingFaceID, name){
  var nfblob = name.components[4].getValue()
  var d = new ndn.Data()
  d.wireDecode(nfblob)
  //d.verify()
  var parameters = JSON.parse(d.content.toString())
  console.log('closing face', parameters.faceID)
  Faces[parameters.faceID].close()
}

//managment.faces.enable_local_control = function(requestingFaceID, name){}

//managment.faces.disable_local_control = function(requestingFaceID, name){}

managment.fib = function (requestingFaceID, name) {
  var verb = name.components[3].toEscapedString()

  if (verb == "add-nexthop"){
    managment.fib.addNextHop(requestingFaceID, name)
  } else if (verb == "remove-nexthop") {
    console.log('not implimented')
    //managment.fib.removeNextHop(requestingFaceID, name)
  }
}

managment.fib.addNextHop =  function(requestingFaceID, name){
  var nfblob = name.components[4].getValue()
  var d = new ndn.Data()
  d.wireDecode(nfblob)
  //d.verify()
  var parameters = JSON.parse(d.content.toString())
  ndn.FIB.put({
    name: new ndn.Name(parameters.uri),
    nextHop: {
      faceID: parameters.faceID || requestingFaceID,
      cost: parameters.cost || 0
    }
  })

  Faces[requestingFaceID].transport.send('done')
}

//managment.fib.removeNextHop = function(requestingFaceID, name){}

module.exports = managment
