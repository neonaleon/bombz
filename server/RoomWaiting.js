//// IMPORTS
var Room = require( './Room' );


function RoomWaiting( room )
{
  this._room = room;

/// PRIVATE VARIABLES
  this._ready = [];
}


//// PUBLIC FUNCTIONS

// creates listeners specific to this state for a player
RoomWaiting.prototype.CreatePlayerListeners = function( player )
{
  var socket = player.GetSocket();

  // client indicates he is ready to play
  socket.on( 'ready', function( data )
  {
    console.log( 'onReadyMessage' );
  });

  // client requests a color change
  socket.on( 'color', function( data )
  {
    console.log( 'onColorMessage' );
  });

  // client leaves room
  socket.on( 'leave', function( data )
  {
    console.log( 'onReadyMessage' );
  });
}

// removes listeners specific to this state for a player
RoomWaiting.prototype.RemovePlayerListeners = function( player )
{
  var socket = player.GetSocket();
  socket.removeAllListeners( 'ready' );
  socket.removeAllListeners( 'color' );
  socket.removeAllListeners( 'leave' );
}

//// STATE PATTERN FUNCTIONS

// entering state
RoomWaiting.prototype.Enter = function()
{
  for ( var index in this._room._players )
    this.CreatePlayerListeners( this._room._players[ index ] );
}

// leaving state
RoomWaiting.prototype.Leave = function()
{
  for ( var index in this._room._players )
    this.RemovePlayerListeners( this._room._players[ index ] );
}

// callback upon adding player to room
RoomWaiting.prototype.AddPlayer = function( player )
{
  if ( this._room._players.length >= Room.MAX || this._room._players.indexOf( player ) != -1 )
    return;

  this._room._players.push( player );

  this.CreatePlayerListeners( player );
}

// callback upon removing player from room
RoomWaiting.prototype.RemovePlayer = function( player )
{
  var index = this._room._players.indexOf( player );

  if ( this._room._players.length < 1 || index  == -1 )
    return;

  this._room._players.splice( index, 1 );

  // DO SOMETHING
  this.RemovePlayerListeners( player );
}

// representation
// used to bring a player who just joined waiting room up to date
RoomWaiting.prototype.Serialize = function()
{

};


//// EXPORTS
module.exports = RoomWaiting;