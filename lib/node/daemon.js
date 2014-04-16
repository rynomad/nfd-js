console.log(process.env.HOME)
var ndn = require('ndn-lib')
  , down = require('leveldown')
  , path = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
  , keys = require('levelup')(path + "/.nfd", {db: down})
var init = function init(callback){
keys.get('public', function(err, value){
  if (err) {
    if (err.notFound) {
      require('node-forge').pki.rsa.generateKeyPair({bits: 2048}, function(er, keys){
      var cert = pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = '01';
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
      cert.sign(keys.privateKey);
      var pem = pki.certificateToPem(cert);
      var pubPem = pki.publicKeyToPem(keys.publicKey);
      var priOpenPem = pki.privateKeyToPem(keys.privateKey);
      ndn.globalKeyManager.certificate = pem;
      ndn.globalKeyManager.publicKey   = pubPem
      nen.globalKeyManager.privateKey  = priOpenPem;
      var ops = [
        { type: 'put', key: 'public', value: pubPem }
      , { type: 'put', key: 'private', value: preOpenPem }
      , { type: 'put', key: 'certificate', value: pem }
      ]
      keys.batch(ops, function(err){
        if (!err) callback()
      })
      })
    }
    // I/O or other error, pass it up the callback chain
    return callback(err)
  } else {
    ndn.globalKeyManager.publicKey = value;
    keys.get('private', function(err, value){
      ndn.globalKeyManager.privateKey = value;
      keys.get('certificate', function(err, value){
        ndn.globalKeyManager.certificate = value;
        callback()
      })
    })
  }
})
}
init(function(){console.log(ndn.globalKeyManager)})
