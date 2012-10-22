// NetworkManager.js
// @author: Leon Ho

var NetworkManager = {};
var socket = undefined;

NetworkManager.sendRate = 0;
NetworkManager.connected = false;

NetworkManager.Connect = function (ip, port, handler)
{
	socket = io.connect(ip);
	socket.on("connect", function(){ 
		NetworkManager.connected = true;
		handler(); 
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
	socket.on(msg, handler(data));
};

// Clears all listeners for a message
NetworkManager.ClearListeners = function (msg)
{
	socket.removeAllListeners(msg);
}

// Request to join a Room
NetworkManager.JoinGame = function (gameID)
{
	socket.emit("joingame", { "gameID": gameID });
};

// Request for a list of available Rooms
NetworkManager.RequestGameList = function (handler)
{
	handler(null); //TEST
	// request for game list from server, async
	socket.on("gamelist", function(data){
		socket.removeAllListeners("gamelist");
		handler(data);
	});
};


