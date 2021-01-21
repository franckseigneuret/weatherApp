var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

var Users = mongoose.model('users', userSchema);

module.exports = Users
