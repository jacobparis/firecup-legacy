#Firecup

Firecup is a party card game similar to King's Cup (Ring of Fire, Sociables), and
this is its online version. A physical card version is on the roadmap.

Landing page is here at http://firecup.ca/

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

Code assumes angular-ui-router is in the /libs/ folder with the rest of the browser
dependencies, but must be installed from npm instead. Install into node_modules
and then move to /libs/


#snippets

//Regex replace anonymous function with named function

Find
`this\.(.*)(\ = function).*.?(\()`

Replace
`this.$1 = $1;\n function $1(`

#Exhaustive List of Rules

Rhyme words must be distinct words. 'Prey' and 'pray' do not rhyme.
A casual drink is one not commanded by a card or rule.

If one card tells you to hold your hands in fists, and another tells you to hold
them flat and straight, do one of each. A third card means you must discard one
of the first two.
#Styleguide for Cards

Do not end card with periods. Other punctuation only if it benefits the card.
Use *may* not *can*
Use *speaks* not *says something*
Use *must* not *has to*
Use *takes a drink* not *drinks*
Use *4* not *four*
Use *you* not *ME* when possible

To insert the current player's name, use *ME*
To choose a player's name at random, use *PLAYERA*
To choose a different player on the same card, use *PLAYERB*
To insert a random line from the DATA field, use *RANDOM*

Use the data field for variations on the same content, most applicable to the categories cards.
