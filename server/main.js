/*===============
  Library Imports
  ===============*/
var lib_path = "./";
require(lib_path + "Config.js");
require(lib_path + "Bomb.js");
require(lib_path + "Player.js");
  
function Server()
{
	/*=========
	  Variables
 	=========*/
	var count;						// Keeps track how many people are connected to server [Private]
	var players;					// Associative array for players, indexed via sid [Private]

	/*==================
	  start [Privileged]
	  ==================*/
	this.start = function()
	{
		try
		{
			count = 0;

			// change log level to 3 for debugging messages
			io = require('socket.io').listen( http,
			{
				'log level':2
			});

			/*----------------------
			  Socket Event Listeners
			  ----------------------*/
			// Upon connection established from a client socket
			io.sockets.on('connection', function (socket) {
				count++;

				// Sends to client
				socket.emit('serverMsg', {msg: "WELCOME!!!"});

				if (count > 2)
				{
					// Send back message that game is full
					socket.emit('serverMsg', {msg: "Sorry, game full. Come back another time!"});

					// Force a disconnect
					socket.disconnect();
					count--;
				} else {

					// Create player object and insert into players with key = socket.id
					players[socket.id] = new Player(socket.id, nextPID, startPos);

					// Updates the nextPID to issue (flip-flop between 1 and 2)
					nextPID = ((nextPID + 1) % 2 === 0) ? 2 : 1;
				}

				// When the client closes the connection to the server/closes the window
				socket.on('disconnect', function( data )
				{
					// Decrease count
					count--;

					// Set nextPID to quitting player's PID
					nextPID = players[socket.id].pid;

					// Remove player who wants to quit/closed the window
					delete players[socket.id];
				});
			});

		}
		catch ( e )
		{
			console.log( "Cannot listen to " + port );
		}
	}
}

// "public static void main(String[] args)"
// This will auto run after this script is loaded
var server = new Server();
server.start();