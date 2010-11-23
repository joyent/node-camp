
var Connect = require('connect');

Connect.createServer(
  Connect.logger(),
  Connect.cache(),
  Connect.staticProvider(__dirname + "/web")
).listen(8080);

console.log("Exploder server running at http://localhost:8080");



