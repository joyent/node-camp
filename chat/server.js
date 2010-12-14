
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var io = require('socket.io');

var http = require('http');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    locals: {
      title: 'Express'
    }
  });
});

app.listen(8080);

var io = io.listen(app)
  , buffer = [];

io.on('connection', function(client){
  client.send({ buffer: buffer });
  client.broadcast({ announcement: client.sessionId + ' connected' });
  
  client.on('message', function(message){
    var msg = { message: [client.sessionId, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast(msg);
  });

  client.on('disconnect', function(){
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
});

// twitter streaming
var lastTweetId;

setInterval(function(){
  var client = http.createClient(80, 'search.twitter.com');
  var request = client.request('GET', '/search.json?q=bieber', {Host: 'search.twitter.com'});
  request.end();
  request.on('response', function(response){
    var data = '';
    response.on('data', function(chunk){
      data += chunk;
    });
    response.on('end', function(){
      var obj = JSON.parse(data);
      var lastTweet = obj.results.shift();
      if (lastTweet.id_str != lastTweetId){
        io.broadcast({ announcement: lastTweet.text });
        lastTweetId = lastTweet.id_str;
      }
    });
  });
}, 5000);

console.log("Express server listening on port %d", app.address().port)
