//// DESIGN
// state pattern


//// IMPORTS
var RoomWaiting = require( './RoomWaiting' );
var RoomPlaying = require( './RoomPlaying' );


function Room( id )
{
//// PRIVATE VARIABLES
  this._id = id;                          // int - identifier
  this._players = [];                     // Player[] - list of player objects
  this._settings;                         // dictionary - represent game's settings

  this._states =                          // {} - state
  {
    'waiting': new RoomWaiting( this ),   // waiting room state
    'playing': new RoomPlaying( this )    // playing in-game state
  };
  this._state = this._states.waiting;          // current state
  
}


//// CONSTANTS
Room.MAX = 4;	// maximum players in room


//// PUBLIC FUNCTIONS

// change state
Room.prototype.SetState = function( state )
{
  if ( this._state === state )
    return;

  this._state.Leave();
  this._state = this._states[ state ];
  this._state.Enter();
}

// add player to room
Room.prototype.AddPlayer = function( player )
{
  this._state.AddPlayer( player );
}

// remove player from room
Room.prototype.RemovePlayer = function( player )
{
  this._state.RemovePlayer( player );
}

// start the game
Room.prototype.StartGame = function()
{

};

// end the game
Room.prototype.EndGame = function()
{

};

// representation
Room.prototype.Serialize = function()
{
  return this._state.Serialize();
}


//// EXPORTS
module.exports = Room;