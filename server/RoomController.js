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

RoomController.prototype.Broadcast = function( message, data, excludeSocket )
{
  var players = this._room.GetPlayers();
  for ( var i in players )
    if ( players[ i ].GetSocket() !== excludeSocket )
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
  this.Broadcast( MessageDefinitions.UPDATE, this.Serialize(), socket );
}

// remove player from room
RoomController.prototype.RemovePlayer = function( socket )
{
  var player = this.GetPlayerFromSocket( socket );
  
  if ( player === undefined )
    return;

  this._room.RemovePlayer( player );
  this.RemovePlayerListeners( socket );

  if ( this._room.GetState() === Room.State.WAITING ) // waiting room
  {
    this.Broadcast( MessageDefinitions.UPDATE, this.Serialize(), socket );
  }
  else // game room
  {
    this.Broadcast( MessageDefinitions.LEAVE, { id: player.GetID() }, socket );

    // all players left room, reset it to waiting state. otherwise, check if anyone has won or powerups need to drop
    if ( this._room.GetPlayerCount() === 0 )
    {
      this.Reset();
    }
    else
    {

    }
  }
}

// start the game
RoomController.prototype.CanStartGame = function()
{
  var room = this._room;

  // must be full room
  //if ( room.GetPlayerCount() != Room.MAX )
  //  return false;

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
/*
RoomController.prototype.StartGame = function()
{
  var room = this._room;

  while ( true )
  {
    console.log( )
  }
};
*/
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
      if ( roomController.CanStartGame() )
      {
        roomController.GetMap().Generate();
        roomController.Broadcast( MessageDefinitions.START, { map: roomController.GetMap().Serialize() } );

        var players = room.GetPlayers();

        // remove waiting state listeners
        for ( var i in players )
          roomController.RemovePlayerListeners( players[ i ].GetSocket() );

        room.SetState( Room.State.PLAYING );

        // add playing state listeners
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
      var player = roomController.GetPlayerFromSocket( socket );
      player.SetDirection( data.dir );
      player.SetPosition( data.x, data.y );

      data.pid = player.GetID();
      data.speed = player.GetSpeed();
      roomController.Broadcast( MessageDefinitions.MOVE, data, socket );
    });

    // player plants a bomb
    socket.on( MessageDefinitions.BOMB, function( data )
    {
      var player = roomController.GetPlayerFromSocket( socket );
      var position = player.GetPosition();

      var bomb = new Bomb( position.x, position.y, player.GetBombRange(), player.GetID() );
      roomController.GetMap().AddBomb( bomb );

      // set timer till bomb explodes and check again??
      var data = {};
      data.pid = player.GetID();

      roomController.Broadcast( MessageDefinitions.BOMB, bomb.Serialize(), socket );
    });

    // player shoots a fireball
    socket.on( MessageDefinitions.FIREBALL, function( data )
    {
      var data = {};
      data.pid = roomController.GetPlayerFromSocket( socket ).GetID();

      roomController.Broadcast( MessageDefinitions.FIREBALL, data, socket );
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