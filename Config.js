var Config = {};
module.exports = Config;

// Game
Config.Game = {};
Config.Game.FPS = 50;
Config.Game.WIDTH = 1000;
Config.Game.HEIGHT = 600;

// Server
Config.Server = {};
Config.Server.PORT = process.env.PORT || 8000;
