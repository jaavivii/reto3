const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user: { type: String, required: true },
  password: { type: String, required: true },
  foto: { type: String }
});

module.exports = mongoose.model('users', userSchema);
