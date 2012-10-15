//// IMPORTS



function Player( id, socket )
{
//// PRIVATE VARIABLES
  this._id = id;			// int - identifier
  this._socket = socket;	// socket

  this._color;				// str - player avatar color
  this._speed;				// int - movement speed
  this._powerups = [];		// Powerup[] - powerups player has - starts with none
  this._bomb_range = 1;		// int - number of grids bomb explodes
  this._bomb_limit = 1;		// int - number of bombs user can use at once


//// PRIVILEGED FUNCTIONS

  // drop bomb on nearest grid
  // returns Bomb object
  this.Bomb = function()
  {
    //var bomb = new Bomb( );
    //return bomb;
  }

  // get killed
  this.Die = function()
  {

  }

  // pick and apply powerup
  this.PickPowerup = function( powerup )
  {
    //powerup.buff( this );
  }

  // drop all powerups and return a list to game
  this.DropAllPowerups = function()
  {
  	//var temp = _powerups;
    //_powerups = [];
    //return temp;
  }
}


//// PUBLIC FUNCTIONS

Player.prototype.GetSocket = function()
{
  return this._socket;
};

Player.prototype.GetSpeed = function()
{
  return this._speed;
}

Player.prototype.SetSpeed = function( speed )
{
  this._speed = speed;
}

Player.prototype.GetBombRange = function()
{
  return this._bomb_range;
}

Player.prototype.SetBombRange = function( range )
{
  this._bomb_range = range;
}

Player.prototype.GetBombLimit = function()
{
  return this._bomb_limit;
}

Player.prototype.SetBombLimit = function( limit )
{
  this._bomb_limit = limit;
}

// representation
Player.prototype.Serialize = function()
{
  return {
    id: this._id,
    color: this._color,
    speed: this._speed
  };
}


//// EXPORTS
module.exports = Player;