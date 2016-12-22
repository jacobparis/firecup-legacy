// grab the mongoose module
const mongoose = require('mongoose');

// define our card model
// module.exports allows us to pass this to other files when it is called
mongoose.model('Game', {
  'settings': {
    type: mongoose.Schema.Types.Mixed
  },
  'title': {
    type: String
  },
  'players': [{
    name: String,
    index: Number,
    source: mongoose.Schema.Types.ObjectId,
    hand: [{
      type: mongoose.Schema.Types.Mixed
    }],
    deviceToken: String,
  }],
  'turn': {
    type: Number
  },
  'totalTurns': {
    type: Number
  },
  'eventDeck': {
    type: Array
  },
  'burnDeck': [{
    type: mongoose.Schema.Types.Mixed
  }],
  'createdAt': {
    type: Date,
    default: Date.now
  }
});
