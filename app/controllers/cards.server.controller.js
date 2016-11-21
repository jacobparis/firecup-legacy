require('../models/Card');

var Card = require('mongoose')
  .model('Card');

var getErrorMessage = function(err) {
  if (err.errors) {
    for (var errName in err.errors) {
      if (err.errors[errName].message) return err.errors[errName].message;
    }
  } else {
    return 'Unknown server error';
  }
};

exports.create = function(req, res, next) {
  var card = new Card(req.body);
  console.log(req.body);
  card.save(function(err) {
    if (err) {
      return next(err);
    } else {
      res.json(card);
    }
  });
};

exports.list = function(req, res, next) {
  if (req.deck) {
    //If retrieving one deck
    res.json(req.deck);
  } else {
    Card.find({}, function(err, cards) {
      if (err) {
        return next(err);
      } else {
        res.json(cards);
      }
    });
  }
};

exports.getByType = function (req, res, next, type) {
  Card.find({
    type: type
  })
  .exec(function(err, deck) {
    if (err)
      return next(err);

    if (!deck)
      return next(new Error('Failed to load cards by type: ' + type));

    req.deck = deck;
    next();
  });
}
exports.read = function(req, res) {
  res.json(req.card);
};

exports.getDeck = function(req, res, next, id) {
  Card.find({
      deck: id
    })
    .exec(function(err, deck) {
      if (err)
        return next(err);

      if (!deck)
        return next(new Error('Failed to load deck ' + id));

      req.deck = deck;
      next();
    });
};

exports.shuffle = function(req, res, next) {
  var m = req.deck.length,
    t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = req.deck[m];
    req.deck[m] = req.deck[i];
    req.deck[i] = t;
  }
  next();
};

exports.cardByID = function(req, res, next, id) {
  Card.findById(id)
    .exec(function(err, card) {
      if (err)
        return next(err);

      if (!card)
        return next(new Error('Failed to load card ' + id));

      req.card = card;
      next();
    });
};
