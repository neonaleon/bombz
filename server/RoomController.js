//// IMPORTS
var Map = require( './../client/package/js/models/Map' );
var Room = require( './../client/package/js/models/Room' );
var Bomb = require( './../client/package/js/models/Bomb' );
var Player = require( './../client/package/js/models/Player' );
var Powerup = require( './../client/package/js/models/Powerup' );
var MessageDefinitions = require( './../client/package/js/definitions/MessageDefinitions' );


function RoomController( id )
{
//// PRIVATE VARIABLES
  //this._map                     // Map
  this._room = new Room( id );

  this.Reset();
}


//// PUBLIC FUNCTIONS
RoomController.prototype.Reset = function( socket )
{
  this._room.Reset();
  this._map = new Map( 19, 15, 40, 40, [] );
}

RoomController.prototype.GetPlayerFromSocket = function( socket )
{
  var players = this._room.GetPlayers();
  for ( var i in players )
    if ( players[ i ].GetSocket() === socket )
      return players[ i ];

  return undefined;
}

RoomController.prototype.Broadcast = function( message, data )
{
  var players = this._room.GetPlayers();
  for ( var i in players )
    players[ i ].GetSocket().emit( message, data );
}

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

  // send update to everyone else but new player since he would have gotten it from room message
  socket.broadcast.emit( MessageDefinitions.UPDATE, this.Serialize() );
}

// remove player from room
RoomController.prototype.RemovePlayer = function( socket )
{
  var player = this.GetPlayerFromSocket( socket );
  
  if ( player === undefined )
    return;

  this._room.RemovePlayer( player );
  this.RemovePlayerListeners( socket );

  if ( this._room.GetState() == Room.State.WAITING ) // waiting room
  {
    socket.broadcast.emit( MessageDefinitions.UPDATE, this.Serialize() );
  }
  else // game room
  {
    // check for winners / losers or give out powerups



    if ( this._room.GetPlayerCount() === 0 )
    {
      this.Reset();
      console.log( "Room empty, RESET" );
    }
  }
}

// start the game
RoomController.prototype.StartGame = function()
{
  var room = this._room;

  // must be full room
  if ( room.GetPlayerCount() != Room.MAX )
    return false;

    // check that everyone has chosen their colors and all different
  var colors = {};
  var players = room.GetPlayers();
  for ( var i in players )
  {
    var color = players[ i ].GetColor();

    if ( color === Player.Color.NONE || color in colors )
    {
      return false;
    }
    else
    {
      colors[ color ] = color;
    }
  }
  return true;
};

// end the game
RoomController.prototype.EndGame = function()
{

};

// creates listeners specific to this state for a player
RoomController.prototype.CreatePlayerListeners = function( socket )
{
  var room = this._room;
  var roomController = this;

  if ( room.GetState() === Room.State.WAITING )
  {
    // client indicates he is ready to play
    socket.on( MessageDefinitions.START, function( data )
    {
      var start = roomController.StartGame();
      if ( start )
      {
        roomController.GetMap().Generate();
        roomController.Broadcast( MessageDefinitions.START, { map: roomController.GetMap().Serialize() } );

        var players = room.GetPlayers();

        for ( var i in players )
          roomController.RemovePlayerListeners( players[ i ].GetSocket() );

        room.SetState( Room.State.PLAYING );

        for ( var i in players )
          roomController.CreatePlayerListeners( players[ i ].GetSocket() );
      }
    });

    // client requests a color change
    socket.on( MessageDefinitions.SEAT, function( data )
    {
      var color;
      switch ( data.color )
      {
        case Player.Color.BLUE:
        case Player.Color.GREEN:
        case Player.Color.RED:
        case Player.Color.PINK:
          color = data.color;
          break;

        default:
          color = Player.Color.NONE;
          break;
      }

      var player = roomController.GetPlayerFromSocket( socket );
      player.SetColor( color );

      roomController.Broadcast( MessageDefinitions.UPDATE, roomController.Serialize() );
      //roomController.Broadcast( 'seat', { id: player.GetID(), color: color } );
    });
  }
  else
  {
    socket.on( MessageDefinitions.TIME, function( data )
    {
      data.serverTime = ( new Date() ).getTime();
      socket.emit( MessageDefinitions.TIME, data );
    });

    // player moves
    socket.on( MessageDefinitions.MOVE, function( data )
    {
      data.pid = roomController.GetPlayerFromSocket( socket ).GetID();
      socket.broadcast.emit( MessageDefinitions.MOVE, data );
    });

    // player plants a bomb
    socket.on( MessageDefinitions.BOMB, function( data )
    {
      // set timer till bomb explodes and check again??
      var data = {};
      data.pid = roomController.GetPlayerFromSocket( socket ).GetID();

      socket.broadcast.emit( MessageDefinitions.BOMB, data );
    });

    // player shoots a fireball
    socket.on( MessageDefinitions.FIREBALL, function( data )
    {
      console.log( 'onFireball' );
    });

    // player kicks a bomb
    socket.on( MessageDefinitions.KICK, function( data )
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
    socket.removeAllListeners( MessageDefinitions.SEAT );
    socket.removeAllListeners( MessageDefinitions.START );
    socket.removeAllListeners( MessageDefinitions.UPDATE );
  }
  else
  {
    socket.removeAllListeners( MessageDefinitions.MOVE );
    socket.removeAllListeners( MessageDefinitions.BOMB );
    socket.removeAllListeners( MessageDefinitions.KICK );
    socket.removeAllListeners( MessageDefinitions.FIREBALL );
  }
}

RoomController.prototype.GetMap = function()
{
  return this._map;
}

RoomController.prototype.GetState = function()
{
  return this._room.GetState();
}

// representation
// used to bring a player who just joined waiting room up to date
RoomController.prototype.Serialize = function( socket )
{
  var data = {};
  data.room = {};
  data.room.players = [];

  var players = this._room.GetPlayers();
  for ( var i in players )
  {
    var player = players[ i ];
    data.room.players[ player.GetID() ] = player.GetColor();
  }

  if ( socket !== undefined )
  {
    data.pid = this.GetPlayerFromSocket( socket ).GetID();
  }

  return data;
};

//// EXPORTS
module.exports = RoomController;