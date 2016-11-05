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
    enum: ["category", "other", "action", "status", "trap"]
  },
  theme: {
    type: String
  },
  deck: {
    type: String,
    enum: ["event", "consequence"]
  },
  color: {
    type: String,
    enum: ["black", "blue"]
  }
});
