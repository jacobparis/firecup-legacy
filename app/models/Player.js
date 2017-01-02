// grab the mongoose module
const mongoose = require('mongoose');

// define our card model
// module.exports allows us to pass this to other files when it is called
mongoose.model('Player', {
  facebook: {
    type: String,
    unique: true,
    required: true,
    dropDups: true
  },
  room: {
    type: String,
  },
  games: {
    type: Number,
    default: 0
  },
  turns: {
    type: Number,
    default: 0
  },
  burns: {
    type: Number,
    default: 0
  },
  statuses: {
    type: Number,
    default: 0
  }
});
