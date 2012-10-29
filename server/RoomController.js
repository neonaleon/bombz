//// IMPORTS
var Map = require( './../client/package/js/models/Map' );
var Room = require( './../client/package/js/models/Room' );
var Bomb = require( './../client/package/js/models/Bomb' );
var Player = require( './../client/package/js/models/Player' );
var Powerup = require( './../client/package/js/models/Powerup' );


function RoomController( id )
{
//// PRIVATE VARIABLES
  this._room = new Room( id );
  this._sockets = [];           // Socker[] - socket for each player, index corresponds with player id
}


//// CONSTANTS


RoomController.prototype.GetPlayerFromSocket = function( socket )
{
  var players = this._room.GetPlayers();
  for ( var i in players )
    if ( players[ i ].GetSocket() === socket )
      return players[ i ];

  return undefined;
}

//// PUBLIC FUNCTIONS
// add player to room - only possible during WAITING state
RoomController.prototype.AddPlayer = function( socket )
{
  if ( this._room.GetState() == Room.State.PLAYING )
    return;

  if ( this._room.GetPlayerCount() >= Room.MAX )
    return;

  // player is already in game
  var players = this._room.GetPlayers();
  for ( var i in players )
    if ( players[ i ].GetSocket() === socket )
      return;

  var pid = this._room.GetNextAvailablePlayerID();
  var player = new Player( pid, socket );
  this._room.AddPlayer( player );

  this.CreatePlayerListeners( socket );
}

// remove player from room
RoomController.prototype.RemovePlayer = function( socket )
{
  var player = this.GetPlayerFromSocket( socket );
  
  if ( player === undefined )
    return;

  this._room.RemovePlayer( player );
  this.RemovePlayerListeners( socket );

  if ( this._room.GetState() == Room.State.WAITING )
  {
    // inform rest about leaving
  }
  else
  {
    // check for winners / losers or give out powerups
  }
}

// start the game
RoomController.prototype.StartGame = function()
{
  
};

// end the game
RoomController.prototype.EndGame = function()
{

};

// creates listeners specific to this state for a player
RoomController.prototype.CreatePlayerListeners = function( socket )
{
  if ( this._room.GetState() === Room.State.WAITING )
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
RoomController.prototype.RemovePlayerListeners = function( socket )
{
  if ( this._room.GetState() === Room.State.WAITING )
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

// representation
// used to bring a player who just joined waiting room up to date
RoomController.prototype.Serialize = function( socket )
{
  var playersData = {};
  var playerID = this.GetPlayerFromSocket( socket ).GetID();
  var players = this._room.GetPlayers();
  for ( var i in players )
  {
    var player = players[ i ];
    playersData[ player.GetID() ] = player.Serialize();
  }

  return {
    pid: playerID,
    players: playersData,
    id: this._room.GetID(),
    state: this._room.GetState(),
    settings: this._room.GetSettings(),
  }
};

//// EXPORTS
module.exports = RoomController;