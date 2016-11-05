var config = require('./config'),
  mongoose = require('mongoose');

module.exports = function() {
  var db = mongoose.connect(config.db);
  //Require models
  require('../app/models/Card');
  return db;
};
