// grab the mongoose module
const mongoose = require('mongoose');

// define our card model
// module.exports allows us to pass this to other files when it is called
mongoose.model('Game', {
  'mode': {
    type: Number
  },
  'title': {
    type: String
  },
  'players': [{
    name: String,
    index: Number,
    hand: [{
      type: mongoose.Schema.Types.Mixed
    }]
  }],
  'turn': {
    type: Number
  },
  'eventDeck': {
    type: Array
  },
  'eventCard': {
    type: mongoose.Schema.Types.Mixed
  },
  'createdAt': {
    type: Date,
    default: Date.now
  }
});
