// Main.js
// @author Leon Ho

window.onload = function()
{
	Crafty.init(Properties.DEVICE_WIDTH, Properties.DEVICE_HEIGHT);
	Crafty.background("#000");
	
	SceneManager.RunWithScene(SceneDefinitions.LobbyScene); //SceneManager.RunWithScene(SceneDefinitions.SplashScene);
};


