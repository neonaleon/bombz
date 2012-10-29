//// IMPORTS
var Room = require( './Room' );
var Player = require( './Player' );


function RoomWaiting( room )
{
  this._room = room;

/// PRIVATE VARIABLES
  this._ready = []; // list of players who are ready?

  this._settings =
  {
    length: 300,    // duration of game before sudden death occurs
  };
}


//// PUBLIC FUNCTIONS

// creates listeners specific to this state for a player
RoomWaiting.prototype.CreatePlayerListeners = function( socket )
{
  var room = this._room;

  // client indicates he is ready to play
  socket.on( 'ready', function( data )
  {
    console.log( 'onReadyMessage' );

    room.SetState( require( './Room' ).State.PLAYING );
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
    // if ( data.length !== undefined ) {}
    // else if ( data.length !== undefined ) {}
    // else if ( data.length !== undefined ) {}
    // else if ( data.length !== undefined ) {}
  });
}

// removes listeners specific to this state for a player
RoomWaiting.prototype.RemovePlayerListeners = function( socket )
{
  socket.removeAllListeners( 'ready' );
  socket.removeAllListeners( 'change' );
  socket.removeAllListeners( 'settings' );
}

//// STATE PATTERN FUNCTIONS

// entering state
RoomWaiting.prototype.Enter = function()
{
  for ( var index in this._room._players )
    this.CreatePlayerListeners( this._room._players[ index ].GetSocket() );
}

// leaving state
RoomWaiting.prototype.Leave = function()
{
  for ( var index in this._room._players )
    this.RemovePlayerListeners( this._room._players[ index ].GetSocket() );
}

// callback upon adding player to room
RoomWaiting.prototype.AddPlayer = function( socket )
{
  if ( this._room._players.length >= Room.MAX )
    return;

  for ( var i = 0; i < this._room._players.length; i++ )
    if ( this._room._players[ i ].GetSocket() == socket )
      return;

  var player = new Player( this._room._players.length, socket );
  this._room._players.push( player );

  this.CreatePlayerListeners( socket );
}

// callback upon removing player from room
RoomWaiting.prototype.RemovePlayer = function( socket )
{
  var index = -1;

  for ( var i = 0; i < this._room._players.length; i++ )
    if ( this._room._players[ i ].GetSocket() == socket )
      index = this._room._players[ i ];

  if ( index == -1 )
    return;

  this._room._players.splice( index, 1 );

  // DO SOMETHING
  this.RemovePlayerListeners( socket );
}

// representation
// used to bring a player who just joined waiting room up to date
RoomWaiting.prototype.Serialize = function()
{
  var players = [];
  for ( var i = 0; i < this._room.GetPlayerCount(); i++ )
    players.push( this._room.GetPlayer( i ).Serialize() );

  return {
    id: this._room.GetID(),
    players: players,
    //state: this._room.GetState(),
    settings: this._settings,
  }
};


//// EXPORTS
module.exports = RoomWaiting;