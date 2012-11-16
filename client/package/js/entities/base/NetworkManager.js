// NetworkManager.js
// @author: Leon Ho
// This object manages the networking for the game
// Its responsibilities include establishing connection, and communication with server

var NetworkManager = {};
var socket = undefined;

NetworkManager.sendRate = 0;
NetworkManager.connected = false;

NetworkManager.localLag = 100;

NetworkManager.Connect = function (ip, port, handler)
{
	socket = io.connect(ip+':'+port);
	socket.on("connect", function(){ 
		NetworkManager.connected = true;
		handler();
	});
	socket.on("disconnect", function(){ 
		NetworkManager.connected = false;
		console.log( "NetworkManager disconnected" );
	});
};

// Send message to server
NetworkManager.SendMessage = function (msg, data)
{
	socket.emit(msg, data);
};

// Listen for a message from server, and invoke the handler
NetworkManager.AddListener = function (msg, handler)
{
	socket.on(msg, function(data){ handler(data); });
};

// Clears all listeners for a message
NetworkManager.ClearListeners = function (msg)
{
	socket.removeAllListeners(msg);
}
