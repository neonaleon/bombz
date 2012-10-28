//// IMPORTS

function Room( id )
{
//// PRIVATE VARIABLES
  this._id = id;                          // int - identifier
  this._players = [];                     // Player[] - list of player objects
  this._settings =                        // dictionary - represent game's settings
  {
    type: Room.Settings.Type.SOLO,
    timeout: Room.Settings.Timeout.FIVE_MINUTES,
    suddendeath: Room.Settings.SuddenDeath.DODGEBALL,
  }
  this._state = Room.State.WAITING;       // current state
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

// add player to room
Room.prototype.AddPlayer = function( player )
{
  if ( this._room._players.length >= Room.MAX )
    return;

  if ( this._room._players.indexOf( player ) != -1 )
    return;

  this._room._players.push( player );
}

// remove player from room
Room.prototype.RemovePlayer = function( player )
{
  var index = this._room._players.indexOf( player );

  if ( index == -1 )
    return;

  this._room._players.splice( index, 1 );
}

Room.prototype.GetPlayer = function( id )
{
  if ( id < 0 || id > this._players.length )
  {
    console.log( 'Invalid player id.' );
    return undefined;
  }

  return this._players[ id ];
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
  return {
    id: this._id,
//    players: [],
    state: this._state,
    settings: this._settings,
  }
}

Room.prototype.Deserialize = function( object )
{
  this._id = object.id;
  //this._players = object.players;
  this._state = object.state;
  this._settings = this._settings;
}


//// EXPORTS
module.exports = Room;