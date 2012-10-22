//// IMPORTS



function Player( id, socket )
{
//// PRIVATE VARIABLES
  this._id = id;			// int - identifier
  this._socket = socket;	// socket

  this._color = 0;			                   	// str - player avatar color
  // this._speed = Player.Default.SPEED;				// int - movement speed
  // this._bomb_range = Player.Default.BOMB_RANGE;		// int - number of grids bomb explodes
  // this._bomb_limit = Player.Default.BOMB_LIMIT;		// int - number of bombs user can use at once
  // this._powerups = Player.Default.POWERUPS.slice();   // Powerup[] - powerups player has - starts with none
  // this._ability_kickbomb = Player.Default.ABILITY_KICKBOMB; // bool - whether player has ability to kick bombs
  this.Reset();
}


//// CONSTANTS
Player.Color =
{
  BLUE: 0,
  GREEN: 1,
  RED: 2,
  PINK: 3,
};

Player.Default =
{
  SPEED: 1,
  POWERUPS: [],
  BOMB_RANGE: 1,
  BOMB_LIMIT: 1,
  ABILITY_KICKBOMB: false,
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
  this._speed = Player.Default.SPEED;
  this._bomb_range = Player.Default.BOMB_RANGE;
  this._bomb_limit = Player.Default.BOMB_LIMIT;
  this._powerups = Player.Default.POWERUPS.slice();
  this._ability_kickbomb = Player.Default.ABILITY_KICKBOMB;
}

// drop bomb on nearest grid
// returns Bomb object
Player.prototype.Bomb = function()
{
  //var bomb = new Bomb( );
  //return bomb;
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


//// EXPORTS
module.exports = Player;