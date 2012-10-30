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


	// all the position settings should go inside GUI.js when using real graphics
	var colorButtons = GUI.OneOrNoneRadioButtonGroup(["Blue", "Green", "Red", "Pink"], handler_Seat);
	colorButtons[ Player.Color.BLUE ].attr({ x: 100, y: 100, h: 200 });
	colorButtons[ Player.Color.GREEN ].attr({ x: 250, y: 100, h: 200 });
	colorButtons[ Player.Color.RED ].attr({ x: 400, y: 100, h: 200 });
	colorButtons[ Player.Color.PINK ].attr({ x: 550, y: 100, h: 200 });

	var timeoutSelecter = GUI.Selector(["3 minutes", "4 minutes", "5 minutes"], handler_TimeoutSettings);
	timeoutSelecter.label.attr({ x: 100, y: 400, h: 50, w: 100 });
	timeoutSelecter.left.attr({ x: 50, y: 400, h: 50, w: 50 });
	timeoutSelecter.right.attr({ x: 200, y: 400, h: 50, w: 50 });

	var suddenDeathSelecter = GUI.Selector(["Dodge Ball", "Shrink"], handler_SuddenDeathSettings);
	suddenDeathSelecter.label.attr({ x: 350, y: 400, h: 50, w: 100 });
	suddenDeathSelecter.left.attr({ x: 300, y: 400, h: 50, w: 50 });
	suddenDeathSelecter.right.attr({ x: 450, y: 400, h: 50, w: 50 });

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
var handler_SeatResponse = function(player)
{
	if ( player.color == Player.Color.NONE )
		console.log( "P" + ( player.id + 1 ) + " unseated" ) ;
	else
		console.log( "P" + ( player.id + 1 ) + " sat on " + player.color );
};
var handler_ReadyResponse = function(data)
{
	console.log(data);
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
	NetworkManager.SendMessage(MessageDefinitions.READY, {})
};
// players chooses colour
var handler_Seat = function( buttonIndex, value )
{
	NetworkManager.SendMessage(MessageDefinitions.SEAT, { color: value ? buttonIndex : Player.Color.NONE });
};
var handler_Settings = function(obj)
{
	console.log("clicked=", obj);
	NetworkManager.SendMessage(MessageDefinitions.UPDATE_SETTINGS, {})
};
var handler_TimeoutSettings = function(choice)
{
	console.log("timeout =", choice);
	//NetworkManager.SendMessage(MessageDefinitions.UPDATE_SETTINGS, {})
};
var handler_SuddenDeathSettings = function(choice)
{
	console.log("sudden death =", choice);
	//NetworkManager.SendMessage(MessageDefinitions.UPDATE_SETTINGS, {})
};

/* 
 * GAME SCENE
 * Game scene is where the game will be played
 */
SceneDefinitions.GameScene = new Scene("GameScene", function()
{ 
	console.log("game scene running");
	
	Map.generate(SpriteDefinitions.MAP_1);
	
	var dragon = Map.spawnPlayer(SpriteDefinitions.BLUE);
	
	var dragon2 = Map.spawnPlayer(SpriteDefinitions.PINK);
	
	var aButton = GUI.ActionButton(GUI.ACTION_BUTTON_A).attr({x:900, y:400});
	var bButton = GUI.ActionButton(GUI.ACTION_BUTTON_B).attr({x:960, y:400});
	
	var pad = GUI.Dpad(dragon, 5, handler_buttonA, handler_buttonB).attr({x:50, y:400}); // may be reworking this
	
	var egg = Entities.Egg().attr({x: 500, y:300, z:999}); // temp only
});

var handler_buttonA = function()
{
	console.log("A DOWN");
}

var handler_buttonB = function()
{
	console.log("B DOWN");
}
