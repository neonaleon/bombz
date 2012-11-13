//// IMPORTS



function Bomb( x, y, range, owner )
{

//// PRIVATE VARIABLES
  this._x = x;          // int - x grid bomb is on
  this._y = y;          // int - y grid bomb is on
  this._range = range;  // int - range of explosion [ > 1 ]
  this._owner = owner;  // int - player id who dropped bomb
}


//// CONSTANTS
Bomb.DURATION = 1500;


//// PUBLIC FUNCTIONS
Bomb.prototype.GetX = function()
{
  return this._x;
}

Bomb.prototype.GetY = function()
{
  return this._y;
}

Bomb.prototype.GetOwner = function()
{
  return this._owner;
}

Bomb.prototype.GetRange = function()
{
  return this._range;
}

// representation
Bomb.prototype.Serialize = function()
{
  return  {
    x: this._x,
    y: this._y,
    range: this._range,
    owner: this._owner,
  };
}


//// EXPORTS
module.exports = Bomb;