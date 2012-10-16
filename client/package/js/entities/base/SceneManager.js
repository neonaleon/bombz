// SceneManager.js
// @author Leon Ho

var SceneManager = {};

SceneManager.previousScene = undefined;
SceneManager.currentScene = undefined;

SceneManager.debugMode = true;
SceneManager._debugScene = function (sceneName, initializer)
{
	return function() 
	{
		Crafty.e("2D, " + Properties.RENDERER + ", Text").attr({x:0, y:0}).textColor("#FF0000").text(sceneName);
		initializer();
	};
};

SceneManager.RunWithScene = function (scene)
{
	SceneManager.ChangeScene(scene);
};

SceneManager.ChangeScene = function (scene)
{
	SceneManager.previousScene = SceneManager.currentScene;
	SceneManager.currentScene = scene;
	
	var sceneName = scene.sceneName;
	var initializer = scene.initializer;
	
	if (SceneManager.debugMode) 
		Crafty.scene(sceneName, SceneManager._debugScene(sceneName, initializer));
	else
		Crafty.scene(sceneName, initializer);

	Crafty.scene(sceneName);
};


