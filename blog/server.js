
/**
 * Module dependencies.
 */

var express = require('express')
  , secure = require('./lib/secure')
  , storage;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('name', 'My cool blog');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieDecoder());
  app.use(express.session())
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  storage = new (require('./lib/storage/memory'));
});

app.configure('production', function(){
  //app.use(express.errorHandler()); 
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  storage = new (require('./lib/storage/fs'))({ dir: __dirname + '/data'});
});

// Routes

app.get('/', function(req, res, next){
  storage.find(function(err, posts){
    if (err) return next(err);
    res.render('index', {locals: { posts: posts, localVariable: 'This is my local variable' } });
  });
});

app.get('/archive', function(req, res, next){
  storage.find(function(err, posts){
    if (err) return next(err);
    res.render('archive', {locals: { posts: posts } });
  });
});

app.get('/post/:id', function(req, res, next){
  storage.lookup(req.param('id'), function(err, post){
    if (err) return next(err);
    res.render('post', {locals: { post: post } });
  });
});

app.get('/admin', secure, function(res, res, next){
  storage.find(function(err, posts){
    if (err) return next(err);
    res.render('admin', {locals: { posts: posts } });
  });
});

app.get('/admin/remove/:id', secure, function(req, res, next){
  storage.remove(req.param('id'), function(err){
    if (err) return next(err);
    res.redirect('/admin');
  });
});

app.post('/admin/new', secure, function(req, res, next){
  storage.add({
    title: req.param('title'),
    content: req.param('content'),
    date: new Date
  }, function(err){
    if (err) return next(err);
    res.redirect('/admin');
  });
});

app.get('/admin/login', function(req, res){
  res.render('login');
});

app.get('/admin/logout', function(req, res){
  setTimeout(function(){
    req.logout();
    res.redirect('/admin');
  }, 2000);
});

app.post('/admin/login', function(req, res){
  if (req.param('username') == 'john' && req.param('password') == 'test'){
    req.login();
    res.redirect('/admin');
  } else {
    res.render('login', {locals: {error: 'Bad login'}});
  }
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port)
}
