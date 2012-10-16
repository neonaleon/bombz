// NetworkManager.js
// @author: Leon Ho

var NetworkManager = {};

NetworkManager.sendRate = 0;

NetworkManager.SendMessage = function (msg, data)
{
	socket.emit(msg, data);
};

NetworkManager.JoinGame = function (gameID)
{
	
};

NetworkManager.RequestGameList = function ()
{
	
};


