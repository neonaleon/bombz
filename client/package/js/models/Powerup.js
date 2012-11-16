/// IMPORTS



function Powerup( type, x, y )
{
//// PRIVATE VARIABLES
  this._x = x;       // int - x grid object is on
  this._y = y;       // int - y grid object is on
  this._type = type; // enum Powerup.Type - type of powerup
}


//// CONSTANTS
Powerup.Type =
{
  BUFF_SPEED: 0,
  BUFF_RANGE: 1,
  BUFF_CAPACITY: 2,
  ABILITY_KICKBOMB: 3,
  ABILITY_FIREBALL: 4,
};

Powerup.SPAWN_RATE = 10000; // every 10 seconds
Powerup.MAX_IN_PLAY = 8; // maximum number at one time in game area
Powerup.MAX_FIREBALL_IN_PLAY = 5; // maximum number of fireball powerups at once in dodgeball area

//// PUBLIC FUNCTIONS

// applies effect of powerup to target player
Powerup.prototype.ApplyEffect = function( player )
{
  switch ( this._type )
  {
    case Powerup.Type.BUFF_SPEED:
      player.SetSpeed( player.GetSpeed() + 2.5 );
      break;

    case Powerup.Type.BUFF_RANGE:
      player.SetBombRange( player.GetBombRange() + 3 );
      break;
  
    case Powerup.Type.BUFF_CAPACITY:
      player.SetBombLimit( player.GetBombLimit() + 3 );
      break;

    case Powerup.Type.ABILITY_KICKBOMB:
      player.SetAbilityKickBomb( true );
      break;

    case Powerup.Type.ABILITY_FIREBALL:
      //player.SetAbilityFireball( true );
      break;

    default:
      console.log( 'Powerup is of unknown type.' );
      break;
  }
};

Powerup.prototype.GetX = function()
{
  return this._x;
}

Powerup.prototype.GetY = function()
{
  return this._y;
}

Powerup.prototype.GetType = function()
{
  return this._type;
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
