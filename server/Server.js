//// IMPORTS
var Room = require( './Room' );
var Player = require( './Player' );
var Config = require( './Config' );
var SocketIO = require( 'socket.io' );


function Server()
{
//// PRIVATE VARIABLES
  this._count = 0;          // int - client count
  this._rooms = [];         // Room[] - list of game rooms
  this._clients = [];       // int->Players[], socket_id -> Player
  this._clientToRoom = [];  // int->Room[], socket_id -> Room - defined only if client is in a room

  // currently only support 1 room so just create at the start, supposed to only make when new rooms are requested for
  this._rooms[ 0 ] = new Room( 0 );
}


//// PUBLIC FUNCTIONS

// assigns client to a room
Server.prototype.SendRoomMessage = function( client )
{
  //socket.emit( 'room', { id: room_id, players: players, settings: settings } );
}

// sends client a welcome message
Server.prototype.SendWelcomeMessage = function( client )
{
  //socket.emit( 'welcome', 'Unable to join.' );
}



// add a newly connected client to server
Server.prototype.AddClient = function( socket )
{
  this._count++;
  this._clients[ socket.id ] = new Player( socket );
}

// adds a client to room
Server.prototype.AddClientToRoom = function( socket )
{
  var player = this._clients[ socket.id ];

  // currently only has one room, add client to it
  var room = this._rooms[ 0 ];
  socket.emit( 'room', { id: room.GetID() } );
  room.AddPlayer( player );
  this._clientToRoom[ socket.id ] = room;
}

// removes a client completely from server
Server.prototype.RemoveClient = function( socket )
{
  this._count--;
  var player = this._clients[ socket.id ];
  var room = this._clientToRoom[ socket.id ];

  // Remove player from room
  if ( room !== undefined )
  {
    room.RemovePlayer( player );
    delete this._clientToRoom[ socket.id ];
    console.log( 'Server::RemoveClient - Player removed from room.' );
  }
  else
  {
    console.log( 'Server::RemoveClient - Socket to Room mapping does not exist.' );
  }
  
  // Remove player from server
  if ( player !== undefined )
  {
    delete this._clients[ socket.id ];
    console.log( 'Server::RemoveClient - Player removed from server.' );
  }
  else
  {
    console.log( 'Server::RemoveClient - Socket to Player mapping does not exist.' );
  }
}

// start server
Server.prototype.Start = function()
{
  var server = this;

  try
  {
    // PRODUCTION
    // change log level to 3 for debugging messages
    //SocketIO.listen( Config.Server.PORT, { 'log level': 2 } );

    // NON-PRODUCTION
    // this is to speed up testing locally instead of deploying client to device
    var io = require( 'socket.io' );
    var express = require( 'express' );
    var http = express.createServer();
    var SocketIO = io.listen( http );
    http.listen( Config.Server.PORT );
    http.configure( function()
    {
      http.use( express.static( __dirname + '/../client/package', { maxAge: 31557600000 } ) );
      http.use( http.router );
    });
    http.all( '*', function( request, response )
    {
      response.send( 404 );
    });
    // NON-PRODUCTION

    // socket events
    SocketIO.sockets.on( 'connection', function( socket )
    {
      if ( server._count >= Room.MAX )
      {
        socket.emit( 'welcome', { msg: "Unable to join. Maximum players reached." } );
        socket.disconnect();
      }
      else
      {
        socket.emit( 'welcome', { msg: "Entered game. Welcome!" } );

        server.AddClient( socket );
        server.AddClientToRoom( socket ); // normally this only happens when a client requests, it is called directly now because there is only 1 room
      }

      // client closes the connection to the server/closes the window
      socket.on( 'disconnect', function()
      {
        server.RemoveClient( socket );
      });

    });
  }
  catch ( exception )
  {
    console.log( "Cannot listen to " + Config.Server.PORT );
  }
}


//// EXPORTS
module.exports = Server;
