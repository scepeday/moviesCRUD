const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  rating: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Movie', movieSchema);
