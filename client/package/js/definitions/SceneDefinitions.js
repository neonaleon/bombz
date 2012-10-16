// SceneDefinitions.js
// @author Leon Ho

function Scene(sceneName, initializer)
{
	this.sceneName = sceneName;
	this.initializer = initializer;
};

var SceneDefinitions = {};

// Splash an image when the app is started
SceneDefinitions.SplashScene = new Scene("SplashScene", function()
{ 
	console.log("Splash Scene Running");
});
										 
// Display a loading image while app loads resources for the next scene
SceneDefinitions.LoadScene = new Scene("LoadScene", function()
{ 
	console.log("Load Scene Running");
});

// The Lobby for getting game information and connecting to games
SceneDefinitions.LobbyScene = new Scene("LobbyScene", function()
{ 
	console.log("Lobby Scene Running");
	GUI.Button("Find Games", handler_FindGames).attr({	x:Properties.DEVICE_WIDTH/2-GUIDefinitions.BUTTON_WIDTH/2,
														y:Properties.DEVICE_HEIGHT/2-GUIDefinitions.BUTTON_HEIGHT/2});
});
var handler_FindGames = function(obj)
{
	console.log("CLICKED!");
	console.log(obj);
};


// Game scene is where the game will be played
SceneDefinitions.GameScene = new Scene("GameScene", function()
{ 
	console.log("Game Scene Running");
});
