#snippets

//Regex replace anonymous function with named
this\.(.*)(\ = function).*.?(\()
this.$1 = $1;\n function $1(
