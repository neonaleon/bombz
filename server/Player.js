//// IMPORTS
var Bomb = require( './Bomb' );


function Player( id, socket )
{
//// PRIVATE VARIABLES
  this._id = id;	      		    // int - identifier - [0 to Room.MAX - 1]
  this._socket = socket;	// socket

  
  // this._x;                // int - player's x co-ordinates in pixels
  // this._y;                // int - player's y co-ordinates in pixels
  // this._speed;            // int - movement speed
  // this._color;            // Player.color - player avatar color
  // this._bombs;            // Bomb[] - bombs currently active in game map
  // this._bomb_range;       // int - number of grids bomb explodes
  // this._bomb_limit;       // int - number of bombs user can use at once
  // this._powerups;         // Powerup[] - powerups player has - starts with none
  // this._ability_kickbomb; // bool - whether player has ability to kick bombs
  this.Reset();
}


//// CONSTANTS
Player.Color =
{
  BLUE: 0,
  GREEN: 1,
  RED: 2,
  PINK: 3,
  NONE: 4,
};

Player.Default =
{
  SPEED: 1,
  BOMBS: [],
  POWERUPS: [],
  BOMB_RANGE: 1,
  BOMB_LIMIT: 1,
  ABILITY_KICKBOMB: false,
  COLOR: Player.Color.NONE,
};


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

Player.prototype.GetColor = function()
{
  return this._color;
}

Player.prototype.SetColor = function( color )
{
  this._color = color;
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

Player.prototype.GetAbilityKickBomb = function()
{
  return this._ability_kickbomb;
}

Player.prototype.SetAbilityKickBomb = function( canKickBomb )
{
  this._ability_kickbomb = canKickBomb;
}


// pick and apply powerup
Player.prototype.PickPowerup = function( powerup )
{
  this._powerups.push( powerup.GetType() );
  powerup.ApplyEffect( this );
}

// drop all powerups and return a list to game
Player.prototype.DropAllPowerups = function()
{
  var temp = this._powerups;
  this._powerups = Player.Default.POWERUPS.slice();
  return temp;
}

// called when player gets killed, resets all stats except color
Player.prototype.Reset = function()
{
  this._x = 0;
  this._y = 0;
  this._color = Player.Default.COLOR;
  this._speed = Player.Default.SPEED;
  this._bombs = Player.Default.BOMBS.slice();
  this._bomb_range = Player.Default.BOMB_RANGE;
  this._bomb_limit = Player.Default.BOMB_LIMIT;
  this._powerups = Player.Default.POWERUPS.slice();
  this._ability_kickbomb = Player.Default.ABILITY_KICKBOMB;
}

// drop bomb on nearest grid
// returns Bomb object
Player.prototype.Bomb = function()
{
  // var bomb = new Bomb( 0, 0, this._bomb_range );
  // this._bombs.push( bomb );
  // return bomb;
}

// representation
// only to be called when informing other players of who is in waiting room
Player.prototype.Serialize = function()
{
  return {
    id: this._id,
    color: this._color,
    speed: this._speed,
    range: this._bomb_range,
    limit: this._bomb_limit,
    powerups: this._powerups,
  };
}

Player.prototype.Deserialize = function( data )
{
  this._id = data.id;
  this._color = data.color;
  this._speed = data.speed;
  this._bomb_range = data.range;
  this._bomb_limit = data.limit;
  this._powerups = data.powerups;
}


//// EXPORTS
module.exports = Player;