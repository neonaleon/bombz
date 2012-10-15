//// IMPORTS



function Bomb( x, y, range )
{

//// PRIVATE VARIABLES
  this._x = x;          // int - x grid bomb is on
  this._y = y;          // int - y grid bomb is on
  this._range = range;  // int - range of explosion [ > 1 ]
  //this._owner = owner;  //    - player who dropped bomb
}


//// PUBLIC FUNCTIONS

// representation
Bomb.prototype.Serialize = function()
{
  return  {
    x: this._x,
    y: this._y,
    range: this._range,
    //owner: this._owner
  };
}


//// EXPORTS
module.exports = Bomb;