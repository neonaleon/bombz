/// IMPORTS



function Powerup( x, y, type )
{
//// PRIVATE VARIABLES
  this._x = x;       // int - x grid object is on
  this._y = y;       // int - y grid object is on
  this._type = type; // enum Powerup.Type - type of powerup
}


//// CONSTANTS
Powerup.Type =
{
  INCREASE_SPEED: 0,
  INCREASE_RANGE: 1,
  INCREASE_CAPACITY: 2
};


//// PUBLIC FUNCTIONS

// applies effect of powerup to target player
Powerup.prototype.ApplyEffect = function( player )
{

};

// representation
Powerup.prototype.Serialize = function()
{
  return {
    x: this._x,
    y: this._y,
    type: this._type
  };
}


//// EXPORTS
module.exports = Powerup;
