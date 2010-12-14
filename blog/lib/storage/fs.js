
/**
 * Module requirements.
 *
 */

var Storage = require('../storage')
  , fs = require('fs');

/**
 * Constructor
 *
 * @api public
 */

function FS(options){
  Storage.call(this, options);
  var self = this;
  fs.readdir(this.options.dir, function(err, files){
    self.count = files.length;
  });
};

/**
 * Inherit from Storage
 *
 */

FS.prototype.__proto__ = Storage;

/**
 * Adds a new item
 *
 * @api public
 */

FS.prototype.add = function(obj, fn){
  var count = this.count++;
  obj.id = count;
  fs.writeFile(this.options.dir + '/' + count, JSON.stringify(obj), fn);
  return this;
};

/**
 * Gets an item by id
 *
 * @api public
 */

FS.prototype.lookup = function(id, fn){
  fs.readFile(this.options.dir + '/' + id, function(err, data){
    if (err) return fn(err);
    fn(null, JSON.parse(data.toString()));
  });
  return this;
};

/**
 * Removes an item
 *
 * @api public
 */

FS.prototype.remove = function(id, fn){
  fs.unlink(this.options.dir + '/' + id, fn);
  return this;
};

/**
 * Gets all items
 *
 * @api public
 */

FS.prototype.find = function(fn){
  var dir = this.options.dir;
  fs.readdir(dir, function(err, files){
    if (err) return fn(err);
    var data = []
      , count = files.length;
    if (!count) fn(null, data);
    files.forEach(function(file, i){
      fs.readFile(dir + '/' + file, function(err, buf){
        if (!err) data[i] = JSON.parse(buf.toString());
        --count || fn(null, data);
      });
    });
  });
  return this;
};

/**
 * Exports
 *
 */

module.exports = FS;
