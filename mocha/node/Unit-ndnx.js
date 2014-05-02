var nfd = require("../../index.js")

var ndn = require("ndn-lib")

var face = new ndn.Face({host:"localhost", port: 6464})

var ndnxSysName = new ndn.Name("ndnx/" +  95bd15d2086a2a3425e2558e5711d80df2609eb8b37d4fd9c876da4d7d1c17d9 + "/")
