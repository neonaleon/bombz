//// IMPORTS
var Map = require( './Map' );
var Bomb = require( './Bomb' );
var Player = require( './Player' );
var Powerup = require( './Powerup' );


function Room( id )
{
//// PRIVATE VARIABLES
  this._id = id;                          // int - identifier
  this._colors = {};                      // Player.Color
  this._players = {};                     // Player{} - list of player objects
  this._settings =                        // dictionary - represent game's settings
  {
    type: Room.Settings.Type.SOLO,
    timeout: Room.Settings.Timeout.FIVE_MINUTES,      // duration of game before sudden death is activated
    suddendeath: Room.Settings.SuddenDeath.DODGEBALL,
  }

  this._state = Room.State.WAITING;      // current state
}


//// CONSTANTS
Room.MAX = 4; // maximum players in room
Room.State =
{
  WAITING: 0,
  PLAYING: 1,
};
Room.Settings = {};
Room.Settings.Type =
{
  SOLO: 0,
  TEAM: 1,
};
Room.Settings.Timeout =
{
  FIVE_MINUTES: 300,
};
Room.Settings.SuddenDeath =
{
  SHRINK: 0,
  DODGEBALL: 1,
};


//// PUBLIC FUNCTIONS

// returns id of room
Room.prototype.GetID = function()
{
  return this._id;
};

Room.prototype.GetState = function()
{
  return this._state;
}

// change state
Room.prototype.SetState = function( state )
{
  this._state = state;
}

Room.prototype.GetNextAvailablePlayerID = function()
{
  for ( var i = 0; i < Room.MAX; i++ )
    if ( !( i in this._players ) )
      return i;

  return undefined;
}

Room.prototype.GetPlayers = function()
{
  return this._players;
}

// add player to room - only possible during WAITING state
Room.prototype.AddPlayer = function( player )
{
  this._players[ player.GetID() ] = player;
}

// remove player from room
Room.prototype.RemovePlayer = function( player )
{
  delete this._players[ player.GetID() ];
}

Room.prototype.GetPlayer = function( id )
{
  if ( !( id in this._players ) )
    return undefined;

  return this._players[ id ];
}

Room.prototype.GetSettings = function()
{
  return this._settings;
}

Room.prototype.GetPlayerCount = function()
{
  return Object.keys( this._players ).length;
}

Room.prototype.Deserialize = function( data )
{
  for ( var i in data.players )
  {
    var player = new Player( i );
    player.SetColor( data.players[ i ] );
    this.AddPlayer( player );
  }
}


//// EXPORTS
module.exports = Room;