
/**
 * Module requirements.
 *
 */

var Storage = require('../storage');

/**
 * Constructor
 *
 * @api public
 */

function Memory(options){
  Storage.call(this, options);
  this.data = [];
};

/**
 * Inherit from Storage
 *
 */

Memory.prototype.__proto__ = Storage;

/**
 * Adds a new item
 *
 * @api public
 */

Memory.prototype.add = function(obj, fn){
  obj.id = this.data.length;
  this.data.push(obj);
  fn(null);
  return this;
};
/**
 * Gets an item by id
 *
 * @api public
 */

Memory.prototype.lookup = function(id, fn){
  fn(this.data[id] == undefined ? new Error : null, this.data[id]);
  return this;
};

/**
 * Removes an item
 *
 * @api public
 */

Memory.prototype.remove = function(id, fn){
  var und = this.data[id] == undefined;
  if (!und) this.data.splice(id, 1);
  fn(und ? new Error : null);
  return this;
};

/**
 * Gets all items
 *
 * @api public
 */

Memory.prototype.find = function(fn){
  fn(null, this.data);
  return this;
};

/**
 * Exports
 *
 */

module.exports = Memory;
