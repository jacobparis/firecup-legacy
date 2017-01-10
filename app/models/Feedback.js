// grab the mongoose module
const mongoose = require('mongoose');

// define our card model
// module.exports allows us to pass this to other files when it is called
mongoose.model('Feedback', {
  contact: {
    type: String
  },
  comment: {
    type: String
  },
  img: {
    type: String
  },
  'createdAt': {
    type: Date,
    default: Date.now
  }
});
