//// IMPORTS
var Room = require( './../client/package/js/models/Room' );
var Player = require( './../client/package/js/models/Player' );
var Config = require( './Config' );
var SocketIO = require( 'socket.io' );
var RoomController = require( './RoomController' );

function Server()
{
  this._count = 0;
//// PRIVATE VARIABLES
  this._rooms = [];         // Room[] - list of game rooms

  // list of clients, maps socket id to object of useful properties
  this._clients = {};       // int->Object, socket_id -> { room: room, socket: socket }

  // currently only support 1 room so just create at the start, supposed to only make when new rooms are requested for
  this._rooms[ 0 ] = new RoomController( 0 );
}


//// PUBLIC FUNCTIONS

Server.prototype.GetRoom = function( id )
{
  return this._rooms[ id ];
}

// add a newly connected client to server
Server.prototype.AddClient = function( socket )
{
  this._count++;
  this._clients[ socket.id ] = {
    socket: socket,
    room: undefined,
  }
}

// adds a client to room
Server.prototype.AddClientToRoom = function( socket )
{
  // currently only has one room, add client to it
  var room = this._rooms[ 0 ];
  room.AddPlayer( socket );
  this._clients[ socket.id ].room = room;
  socket.emit( 'room', { room: room.Serialize( socket ) } );
}

// removes a client completely from server
Server.prototype.RemoveClient = function( socket )
{
  this._count--;
  var room = this._clients[ socket.id ].room;

  // remove player from room if he's in one
  if ( room !== undefined )
  {
    room.RemovePlayer( socket );
    console.log( 'Server::RemoveClient - Player removed from room.' );
  }
  else
  {
    console.log( 'Server::RemoveClient - Player is not in any room.' );
  }

  // remove player from server
  delete this._clients[ socket.id ];
  console.log( 'Server::RemoveClient - Player removed from server.' );
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
