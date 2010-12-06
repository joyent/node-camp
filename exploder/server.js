
var Connect = require('connect');

var web = __dirname + "/web";

Connect.createServer(
  Connect.logger(),
  Connect.staticProvider(web)
).listen(8080);

console.log("Exploder server running at http://localhost:8080");



