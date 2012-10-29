//// IMPORTS
var Map = require( './Map' );
var Bomb = require( './Bomb' );
var Player = require( './Player' );
var Powerup = require( './Powerup' );


function Room( id )
{
//// PRIVATE VARIABLES
  this._id = id;                          // int - identifier
  this._players = {};                     // Player[] - list of player objects
  this._settings =                        // dictionary - represent game's settings
  {
    type: Room.Settings.Type.SOLO,
    timeout: Room.Settings.Timeout.FIVE_MINUTES,      // duration of game before sudden death is activated
    suddendeath: Room.Settings.SuddenDeath.DODGEBALL,
  }

  this._state = Room.State.WAITING;      // current state

  // WAITING state specific
  this._ready = []; // list of players who are ready?
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

Room.prototype.AvailablePlayerID = function()
{
  for ( var i = 0; i < Room.MAX; i++ )
    if ( !( i in this._players ) )
      return i;

  return undefined;
}

// add player to room - only possible during WAITING state
Room.prototype.AddPlayer = function( socket )
{
  if ( this._state == Room.State.PLAYING )
    return;

  if ( this.GetPlayerCount() >= Room.MAX )
    return;

  for ( var i in this._players )
    if ( this._players[ i ].GetSocket() === socket )
      return;

  var player = new Player( this._players.length, socket );
  this._players.push( player );

  // this.CreatePlayerListeners( socket );
}

// remove player from room
Room.prototype.RemovePlayer = function( socket )
{
  var index;

  for ( var i in this._players )
    if ( this.GetPlayer( i ).GetSocket() === socket )
      index = i;

  if ( index === undefined )
    return;

  var player = this.GetPlayer( index );
  this._players.splice( index, 1 );

  if ( this._state == Room.State.WAITING )
  {
    // inform rest about leaving
  }
  else
  {
    // check for winners / losers or give out powerups
  }

  // this.RemovePlayerListeners( socket );
}

Room.prototype.GetPlayer = function( id )
{
  if ( !( id in this._players ) )
    return undefined;

  return this._players[ id ];
}

Room.prototype.GetPlayerCount = function()
{
  return Object.keys( this._players ).length;
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
// used to bring a player who just joined waiting room up to date
Room.prototype.Serialize = function()
{
  var players = [];
  for ( var i = 0; i < this.GetPlayerCount(); i++ )
    players.push( this.GetPlayer( i ).Serialize() );

  return {
    id: this._id,
    players: players,
    //state: this.GetState(),
    settings: this._settings,
  }
};

Room.prototype.Deserialize = function( data )
{
  this._id = data.id;
  this._players = [];
  for ( var i = 0; i < data.players.length; i++ )
  {
    var player = new Player();
    player.Deserialize( data );
    this._players.push( player );
  }
  this._state = data.state;
  this._settings = data.settings;
}

// creates listeners specific to this state for a player
Room.prototype.CreatePlayerListeners = function( socket )
{
  if ( this._state === Room.State.WAITING )
  {
  // client indicates he is ready to play
  socket.on( 'ready', function( data )
  {
    console.log( 'onReadyMessage' );

    //SetState( Room.State.PLAYING );
  });

  // client requests a color change
  socket.on( 'seat', function( data )
  {
    console.log( 'seat', data );

    var color;
    switch ( data.color )
    {
      case Player.Color.BLUE:
      case Player.Color.GREEN:
      case Player.Color.RED:
      case Player.Color.PINK:
      case Player.Color.NONE:
        color = data.color;
        // set player
        break;

      default:
        color = Player.Color.NONE;
        break;
    }

    socket.emit( 'seat', { color: color } );
  });

  // client requests a change in game settings
  socket.on( 'settings', function( data )
  {
    console.log( 'onSettingsMessage' );
    socket.emit( 'settings', { msg: 'settingsReply' } );
  });
  }
  else
  {
    // player moves
    socket.on( 'move', function( data )
    {
      console.log( 'onMove' );
    });

    // player plants a bomb
    socket.on( 'bomb', function( data )
    {
      console.log( 'onBomb' );
      // set timer till bomb explodes and check again
    });

    // player shoots a fireball
    socket.on( 'fireball', function( data )
    {
      console.log( 'onFireball' );
    });

    // player kicks a bomb
    socket.on( 'kickbomb', function( data )
    {
      // CHECK If PLAYER HAS ABILITY
      console.log( 'onKickBomb' );
    });
  }
}

// removes listeners specific to this state for a player
Room.prototype.RemovePlayerListeners = function( socket )
{
  if ( this._state === Room.State.WAITING )
  {
    socket.removeAllListeners( 'ready' );
    socket.removeAllListeners( 'change' );
    socket.removeAllListeners( 'settings' );
  }
  else
  {
    socket.removeAllListeners( 'move' );
    socket.removeAllListeners( 'bomb' );
    socket.removeAllListeners( 'fireball' );
    socket.removeAllListeners( 'kickbomb' );
  }
}


//// EXPORTS
module.exports = Room;