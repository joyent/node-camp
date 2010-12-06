var Connect = require('connect');

var PORT = process.env.PORT || 8080;

// Serve static files and log requests to the server
Connect.createServer(
  Connect.logger(),
  Connect.staticProvider('web')
).listen(PORT);

console.log("Exploder server running at http://localhost:%s", PORT);

