// SceneDefinitions.js
// @author Leon Ho
// This file contains definitions for the scenes we will use in the game

function Scene(sceneName, initializer)
{
	this.sceneName = sceneName;
	this.initializer = initializer;
};

var SceneDefinitions = {};

/*
 * SPLASH SCENE
 * Splash an image when the app is started
 */
SceneDefinitions.SplashScene = new Scene("SplashScene", function()
{ 
	console.log("splash scene running");
	// show some splash image
	// connect to server
	// some duration later change scene, we might want to use this duration to load assets etc
	setTimeout(function(){ SceneManager.ChangeScene(SceneDefinitions.WaitingRoomScene) }, Properties.SPLASH_DURATION);
});

/*
 * LOAD SCENE
 * Display a loading image while app loads resources for the next scene
 */
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
	var buttons = ["Ready", "Settings"];
	var e; // FOR TESTING JOYSTICK
	for (var i = 0; i < buttons.length; i++)
	{
		e = GUI.Button(buttons[i], eval("handler_" + buttons[i]))
				.attr({	x:(i+1)*Properties.DEVICE_WIDTH/4 - GUIDefinitions.BUTTON_WIDTH/2, 
						y:Properties.DEVICE_WIDTH/2-GUIDefinitions.BUTTON_HEIGHT/2});
	}

	var seats = ["BlueSeat", "GreenSeat", "RedSeat", "PinkSeat"];
	for (var i = 0; i < seats.length; i++)
	{
		e = GUI.Button(seats[i], eval("handler_" + seats[i]))
				.attr({	x:(i+1)*Properties.DEVICE_WIDTH/4 - GUIDefinitions.BUTTON_WIDTH/2, 
						y:150});
	}

	// change scene to game scene
	var stick = GUI.Joystick(100, 100, e, 5);
	stick.shift(100, 100);
	
	// Map.generate(SpriteDefinitions.MAP_1);
});
var handler_Connect = function()
{
	console.log("NetworkManager connected");
	NetworkManager.AddListener(MessageDefinitions.READY, handler_ReadyResponse);
	NetworkManager.AddListener(MessageDefinitions.SEAT, handler_SeatResponse);
	NetworkManager.AddListener(MessageDefinitions.ENTER_ROOM, handler_EnterRoomResponse);
	NetworkManager.AddListener(MessageDefinitions.ROOM_UPDATE, handler_SettingsResponse);
	NetworkManager.AddListener(MessageDefinitions.UPDATE_SETTINGS, handler_RoomUpdateResponse);
};
var handler_EnterRoomResponse = function(data)
{
	console.log("handler_EnterRoomResponse: ", data);
	// read from data, initialize game data
	GameState.JoinRoom( data.room );

};
var handler_Seat = function(data)
{
	console.log("handler_Seat: ", data);
	//switch
};
var handler_SeatResponse = function(data)
{
	console.log("handler_SeatResponse: ", data);
};
var handler_ReadyResponse = function(data)
{
	console.log("handler_ReadyResponse: ", data);
};
var handler_SettingsResponse = function(data)
{
	console.log("handler_SettingsResponse: ", data);
};
var handler_RoomUpdateResponse = function(data)
{
	console.log("handler_RoomUpdateResponse: ", data);
};
var handler_Ready = function(obj)
{
	console.log("clicked=", obj);
	NetworkManager.SendMessage(MessageDefinitions.READY, {})
};
var handler_Settings = function(obj)
{
	console.log("clicked=", obj);
	NetworkManager.SendMessage(MessageDefinitions.UPDATE_SETTINGS, {})
};
// following buttons at seats for player to choose
var handler_BlueSeat = function(obj, state)
{
	NetworkManager.SendMessage(MessageDefinitions.SEAT, { color: Player.Color.BLUE });
};
var handler_GreenSeat = function(data)
{
	NetworkManager.SendMessage(MessageDefinitions.SEAT, { color: Player.Color.GREEN });
};
var handler_RedSeat = function(data)
{
	NetworkManager.SendMessage(MessageDefinitions.SEAT, { color: Player.Color.RED });
};
var handler_PinkSeat = function(data)
{
	NetworkManager.SendMessage(MessageDefinitions.SEAT, { color: Player.Color.PINK });
};
/* 
 * GAME SCENE
 * Game scene is where the game will be played
 */
SceneDefinitions.GameScene = new Scene("GameScene", function()
{ 
	console.log("game scene running");
	
	Map.generate(SpriteDefinitions.MAP_1);
	
	var dragon = Map.spawnPlayer(SpriteDefinitions.BLUE_DRAGON, 0, 0);
	
	var dragon2 = Map.spawnPlayer(SpriteDefinitions.PINK_DRAGON, 0, 0);
	
	var stick = GUI.Joystick(50, 400, dragon2, 5);
});
