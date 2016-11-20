#The Game of Sins

Sins is a party card game similar to King's Cup (Ring of Fire, Sociables), and
this is its online version. A physical card version is on the roadmap.

Landing page is here at http://sins.jacobpariseau.com/

#TODO

* Refuse 0 character names on startup
* Enable https
* Allow name slugs in cards, so player names can appear in game (Smite John)
* Cap status cards at 3 and trap cards at 6 per player, allow to discard when over
the limit
* Users should be able to choose card themes they want to include. English savvy
people can have adjective, noun based cards while others may want sports trivia.
Non drinkers should be able to opt out of drinking cards.
* Learn TDD and refactor app to be test driven

#snippets

//Regex replace anonymous function with named function

Find
`this\.(.*)(\ = function).*.?(\()`

Replace
`this.$1 = $1;\n function $1(`
