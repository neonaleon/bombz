//// IMPORTS
var Room = require( './Room' );
var Player = require( './Player' );
var Config = require( './Config' );
var SocketIO = require( 'socket.io' );


function Server()
{
//// PRIVATE VARIABLES
  this._count = 0;    // int - client count
  this._rooms = {};   // Room[] - list of game rooms
  this._clients = {}; // int->Players{}, socket_id -> Player

  // currently only support 1 room so just create at the start, supposed to only make when new rooms are requested for
  this._pid = 0;
  //this._rooms[ 0 ] = new Room( 0 );
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

// start server
Server.prototype.Start = function()
{
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
      http.use( express.static( __dirname + '/../client/package' ) );
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
      if ( this._count >= Room.MAX )
      {
        socket.emit( 'welcome', { msg: "Unable to join. Maximum players reached." } );
        socket.disconnect();
      }
      else
      {
        socket.emit( 'welcome', { msg: "Entered game. Welcome!" } );
/*
        var player = new Player( this._pid, socket );
        this._pid++;
        this._count++;
        //this._clients[ socket.id ] = player;

        // currently only has one room, add client to it
        var room = this._rooms[ 0 ];
        socket.emit( 'room', { id: 0 } );
        room.AddPlayer( player );*/
      }

      // client closes the connection to the server/closes the window
      socket.on( 'disconnect', function()
      {
  /*      this._count--;

        // currently only has one room, otherwise must lookup room client is in
        var room = this._rooms[ 0 ];
        var player = this._clients[ socket.id ];
        room.RemovePlayer( player );

        delete this._clients[ socket.id ];*/
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
