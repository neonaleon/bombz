Math.PI*3/4// main.js
// @author Leon Ho

window.onload = function()
{
	Crafty.init(Properties.DEVICE_WIDTH, Properties.DEVICE_HEIGHT);
	Crafty.background("#FFFFFF");
	
	//SceneManager.RunWithScene(SceneDefinitions.WaitingRoomScene);
	SceneManager.RunWithScene(SceneDefinitions.GameScene);
	//SceneManager.RunWithScene(SceneDefinitions.SplashScene);
};


