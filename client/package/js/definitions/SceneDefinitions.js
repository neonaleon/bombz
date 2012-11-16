/*
 * SceneDefinitions.js
 * @author: Leon Ho
 * @author: Eldwin
 * This file contains definitions for the scenes we will use in the game
 */

var SceneDefinitions = {};

function Scene(sceneName, initializer)
{
	this.sceneName = sceneName;
	this.initializer = initializer;
};

// The Waiting Room
SceneDefinitions.WaitingRoomScene = new Scene("WaitingRoomScene", function()
{
	// beyond the first time entering this scene, the network manager would have been connected already
	if ( NetworkManager.connected )
		handler_Connect();
	else
		NetworkManager.Connect(Properties.MASTERSERVER_IP, Properties.MASTERSERVER_PORT, handler_Connect);

	console.log("waiting room scene running");

	var startButton = GUI.Button( "Start", handler_Start );
	startButton.attr({	x: Properties.DEVICE_WIDTH - 2 * GUIDefinitions.BUTTON_WIDTH })
	startButton.attr({	y: Properties.DEVICE_HEIGHT - 2 * GUIDefinitions.BUTTON_HEIGHT });

	// all the position settings should go inside GUI.js when using real graphics
	var colorButtons = GUI.OneOrNoneRadioButtonGroup(["Blue", "Green", "Red", "Pink"], handler_Seat);
	// colorButtons[ Player.Color.BLUE ].attr({ x: 100, y: 100, w: 150, h: 350 });
	// colorButtons[ Player.Color.GREEN ].attr({ x: 300, y: 100, w: 150, h: 350 });
	// colorButtons[ Player.Color.RED ].attr({ x: 500, y: 100, w: 150, h: 350 });
	// colorButtons[ Player.Color.PINK ].attr({ x: 700, y: 100, w: 150, h: 350 });
	colorButtons[ Player.Color.BLUE ].attr({ x: 100, y: 100});
	colorButtons[ Player.Color.GREEN ].attr({ x: 300, y: 100});
	colorButtons[ Player.Color.RED ].attr({ x: 500, y: 100});
	colorButtons[ Player.Color.PINK ].attr({ x: 700, y: 100});

});
var handler_Connect = function()
{
	console.log("NetworkManager connected");
	NetworkManager.AddListener(MessageDefinitions.SEAT, handler_SeatResponse);
	NetworkManager.AddListener(MessageDefinitions.START, handler_StartResponse);
	NetworkManager.AddListener(MessageDefinitions.UPDATE, handler_UpdateResponse);
	NetworkManager.AddListener(MessageDefinitions.ENTER_ROOM, handler_EnterRoomResponse);
};
// broadcast receiver for reponses to all players seatting on color
var handler_SeatResponse = function(player)
{
	if ( player.color == Player.Color.NONE )
		console.log( "P" + ( player.id + 1 ) + " unseated" ) ;
	else
		console.log( "P" + ( player.id + 1 ) + " sat on " + player.color );
};
// broadcast response when game is starting
var handler_StartResponse = function(data)
{
	NetworkManager.ClearListeners(MessageDefinitions.SEAT);
	NetworkManager.ClearListeners(MessageDefinitions.START);
	NetworkManager.ClearListeners(MessageDefinitions.UPDATE);
	NetworkManager.ClearListeners(MessageDefinitions.ENTER_ROOM);

	GameState.SetMap( data.map );
	SceneManager.ChangeScene( SceneDefinitions.GameScene );
};
var handler_UpdateResponse = function(data)
{
	GameState.UpdateRoom( data );
};
var handler_EnterRoomResponse = function(data)
{
	GameState.UpdateRoom( data );
};
// request for game to start (on leader will see the button)
var handler_Start = function(obj)
{
	NetworkManager.SendMessage(MessageDefinitions.START, {})
};
// players seats on a colour
var handler_Seat = function( buttonIndex, value )
{
	NetworkManager.SendMessage(MessageDefinitions.SEAT, { color: value ? buttonIndex : Player.Color.NONE });
};

/* 
 * GAME SCENE
 * Game scene is where the game will be played
 */
SceneDefinitions.GameScene = new Scene("GameScene", function()
{
	console.log("game scene running");

	// network messages
	WallClock.sync(); // sync wallclock with server so we can use timestamps
	NetworkManager.AddListener(MessageDefinitions.WIN, handler_Win);
	NetworkManager.AddListener(MessageDefinitions.MOVE, handler_Move);
	NetworkManager.AddListener(MessageDefinitions.BOMB, handler_Bomb);
	NetworkManager.AddListener(MessageDefinitions.DEATH, handler_Death);
	NetworkManager.AddListener(MessageDefinitions.LEAVE, handler_Leave); // player leaves/disconnects
	NetworkManager.AddListener(MessageDefinitions.POWERUP, handler_Powerup);
	NetworkManager.AddListener(MessageDefinitions.FIREBALL, handler_Fireball);

	// generate map and entities
	Map.generate(GameState.GetMap());


	dragons = {};
	var players = GameState.GetRoom().GetPlayers();
	for ( var i in players )
	{
		var player = players[ i ];
		dragons[ player.GetID() ] = Map.spawnPlayer( player.GetColor() );
		// add networked player component to sync state of remote players
		if (player.GetID() != GameState.GetLocalPlayer().GetID()) dragons[player.GetID()].addComponent('NetworkedPlayer');
	}
	
	dragons[GameState.GetLocalPlayer().GetID()].addComponent('LocalPlayer');

	// setup GUI
	var aButton = GUI.ActionButton(GUI.ACTION_BUTTON_A).attr({x:900, y:400});
	var bButton = GUI.ActionButton(GUI.ACTION_BUTTON_B).attr({x:960, y:400});
	//dragons[ GameState.GetLocalPlayer().GetID() ].attr({x: Map._instance.x, y:0 } );
	//Map.movePlayerOutside(dragons[ GameState.GetLocalPlayer().GetID() ]);
	//Map.suddenDeath();
	var pad = GUI.Dpad(dragons[ GameState.GetLocalPlayer().GetID() ] ).attr({x:50, y:400}); // allow player to control the dragon
});
var handler_Win = function(data)
{
	console.log( "P" + ( data.pid + 1 ) + " is the winner!" ) ;

	NetworkManager.ClearListeners(MessageDefinitions.WIN);
	NetworkManager.ClearListeners(MessageDefinitions.MOVE);
	NetworkManager.ClearListeners(MessageDefinitions.BOMB);
	NetworkManager.ClearListeners(MessageDefinitions.DEATH);
	NetworkManager.ClearListeners(MessageDefinitions.LEAVE);
	NetworkManager.ClearListeners(MessageDefinitions.POWERUP);
	NetworkManager.ClearListeners(MessageDefinitions.FIREBALL);

	SceneManager.ChangeScene( SceneDefinitions.WaitingRoomScene );
};
var handler_Move = function(data)
{
	//var dragon = dragons[ data.pid ];
	//dragon.attr({ x: data.x, y: data.y });
	//dragon.trigger( "ChangeDirection", data.dir );
	var dragon = dragons[data.pid];
	dragon.trigger('network_update', data);
};
var handler_Bomb = function(data)
{
	Map.spawnEggOnTile( dragons[ data.owner ], { x: data.x, y: data.y } );
};
var handler_Death = function(data)
{
	dragons[ data.pid ].trigger('killed', data);
};
var handler_Powerup = function(powerup)
{
	if (powerup.pid !== undefined)
	{
		console.log(powerup);

		// need to search for powerup at x and y and remove them if not already destroyed
		var powerups = Crafty("Powerup");
		for (var i = 0; i < powerups.length; i++)
		{
			var p = Crafty(powerups[ i ]);
			var tile = Map.pixelToTile({ x: p.x, y: p.y });
			if (tile.x === powerup.x && tile.y === powerup.y)
			{
				p.destroy();
				break;
			}
		}

		var dragon = dragons[ powerup.pid ];
		dragon.addComponent(EntityDefinitions.POWERUP_SPRITES[ powerup.type ] + "_powerup");
		dragon.trigger('applyPowerup');
	}
	else
	{
		Map.spawnPowerup(EntityDefinitions.POWERUP_SPRITES[powerup.type], powerup.x, powerup.y);
	}
};
var handler_Fireball = function(data)
{
	console.log( "P" + ( data.pid + 1 ) + " spit fireball." ) ;
};
var handler_Leave = function(data)
{
	dragons[ data.id ].destroy();
	console.log( "P" + ( data.id + 1 ) + " has left the game." ) ;

	// message should have more things like powerups dropped by player
};

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
