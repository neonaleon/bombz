//// IMPORTS
var Map = require( './Map' );
var Bomb = require( './Bomb' );
var Player = require( './Player' );
var Powerup = require( './Powerup' );


function RoomController( id )
{
//// PRIVATE VARIABLES
  this._room = new Room( id );
  this._sockets = [];           // Socker[] - socket for each player, index corresponds with player id
}


//// CONSTANTS



//// PUBLIC FUNCTIONS
// add player to room - only possible during WAITING state
RoomController.prototype.AddPlayer = function( socket )
{
  this._room.AddPlayer( socket );
  this.CreatePlayerListeners( socket );
}

// remove player from room
RoomController.prototype.RemovePlayer = function( socket )
{
  this._room.RemovePlayer( socket );
  this.RemovePlayerListeners( socket );
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
RoomController.prototype.RemovePlayerListeners = function( socket )
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