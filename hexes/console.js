var net = require('net');
var sys = require('sys');
var host = process.argv[2] || "localhost";
var port = process.argv[3] || 9000;

var client = net.createConnection(port, host);
client.on('connect', function () {
  console.log("Connected! Use Control+C to exit\n");
});

sys.pump(client, process.stdout);
sys.pump(process.openStdin(), client);
