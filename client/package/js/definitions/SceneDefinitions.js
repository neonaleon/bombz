// SceneDefinitions.js
// @author Leon Ho
// This file contains definitions for the scenes we will use in the game

function Scene(sceneName, initializer)
{
	this.sceneName = sceneName;
	this.initializer = initializer;
};

var SceneDefinitions = {};

// Splash an image when the app is started
SceneDefinitions.SplashScene = new Scene("SplashScene", function()
{ 
	console.log("splash scene running");
	// show some splash image
	// connect to server
	// some duration later change scene, we might want to use this duration to load assets etc
	setTimeout(function(){ SceneManager.ChangeScene(SceneDefinitions.WaitingRoomScene) }, Properties.SPLASH_DURATION);
});
										 
// Display a loading image while app loads resources for the next scene
SceneDefinitions.LoadScene = new Scene("LoadScene", function()
{ 
	console.log("load scene running");
});

// The Lobby for getting game information and connecting to games
SceneDefinitions.LobbyScene = new Scene("LobbyScene", function()
{ 
	console.log("lobby scene running");
	GUI.Button("Find Games", handler_FindGames).attr({	x:Properties.DEVICE_WIDTH/2-GUIDefinitions.BUTTON_WIDTH/2,
														y:Properties.DEVICE_HEIGHT/2-GUIDefinitions.BUTTON_HEIGHT/2});
});
var handler_FindGames = function(obj)
{
	console.log("clicked=", obj);
	NetworkManager.RequestGameList(handler_PopulateGameLobby);
};
var handler_PopulateGameLobby = function (data)
{
	console.log("populate game lobby with=", data);
};

// The Waiting Room
SceneDefinitions.WaitingRoomScene = new Scene("WaitingRoomScene", function()
{
	NetworkManager.Connect(Properties.MASTERSERVER_IP, Properties.MASTERSERVER_PORT, handler_Connect);
	
	console.log("waiting room scene running");
	var buttons = ["Ready", "Change", "Settings"];
	var e; // FOR TESTING JOYSTICK
	for (var i = 0; i < 3; i++)
	{
		e = GUI.Button(buttons[i], eval("handler_"+buttons[i]))
				.attr({	x:(i+1)*Properties.DEVICE_WIDTH/4 - GUIDefinitions.BUTTON_WIDTH/2, 
						y:Properties.DEVICE_WIDTH/2-GUIDefinitions.BUTTON_HEIGHT/2});
	}
	// change scene to game scene
	var stick = GUI.Joystick(100, 100, e, 5);
	stick.shift(100, 100);
});
var handler_Connect = function()
{
	console.log("NetworkManager connected");
	NetworkManager.AddListener(MessageDefinitions.ROOM, handler_JoinRoom);
};
var handler_JoinRoom = function (data)
{
	console.log(data);
	// read from data, initialize game data
};
var handler_Ready = function(obj)
{
	console.log("clicked=", obj);
	NetworkManager.SendMessage(MessageDefinitions.READY, {})
};
var handler_Change = function(obj)
{
	console.log("clicked=", obj);
	NetworkManager.SendMessage(MessageDefinitions.CHANGE_COLOR, {})
};
var handler_Settings = function(obj)
{
	console.log("clicked=", obj);
	NetworkManager.SendMessage(MessageDefinitions.UPDATE_SETTINGS, {})
};

// Game scene is where the game will be played
SceneDefinitions.GameScene = new Scene("GameScene", function()
{ 
	console.log("game scene running");
});
