
/**
 * Security middleware
 *
 */

module.exports = function(req, res, next){
  if (req.session.authenticated){
    next();
  } else {
    res.redirect('/admin/login');
  }
};

/**
 * Extend Request to provide logging in capabilities
 *
 * @api public
 */

require('http').IncomingMessage.prototype.login = function(){
  this.session.authenticated = true;
};

/**
 * Extend Request to provide logging out capabilities
 *
 * @param text
 */

require('http').IncomingMessage.prototype.logout = function(){
  this.session.authenticated = false;
};
