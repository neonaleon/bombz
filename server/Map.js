//// IMPORTS
var Bomb = require( './Bomb' );
var Powerup = require( './Powerup' );


function Map()
{
//// PRIVATE VARIABLES
  this._width;        // int - number of grids vertically
  this._height;       // int - number of grids horizontally 
}


//// PUBLIC FUNCTIONS

// representation
// used when map is just generated at start of game
// non-visible power ups (within blocks) are not included here otherwide players can cheat
Map.prototype.Serialize = function()
{
  return {
    width: this._width,
    height: this._height
  };
}

//// EXPORTS
module.exports = Map;