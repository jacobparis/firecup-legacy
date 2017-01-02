// grab the mongoose module
const mongoose = require('mongoose');

// define our card model
// module.exports allows us to pass this to other files when it is called
mongoose.model('Game', {
  name: String,
  index: Number,
  source: mongoose.Schema.Types.ObjectId,
  hand: [{
    type: mongoose.Schema.Types.Mixed
  }],
  deviceToken: String,
  facebook: String,
});
