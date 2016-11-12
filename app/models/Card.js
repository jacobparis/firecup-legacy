// grab the mongoose module
var mongoose = require('mongoose');

// define our card model
// module.exports allows us to pass this to other files when it is called
mongoose.model('Card', {
  primary: {
    type: String,
    uppercase: true
  },
  secondary: {
    type: String,
    lowercase: true
  },
  type: {
    type: String,
    enum: ["event", "action", "status", "trap"]
  },
  model: {
    type: String,
  },
  theme: {
    type: String
  },
  deck: {
    type: String,
    enum: ["event", "consequence"]
  }
});
