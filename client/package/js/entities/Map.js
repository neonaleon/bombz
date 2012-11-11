/*
 * Map.js
 * @author: Leon Ho
 * @author: Natalie
 */
var Map = {
	
	MAP_WIDTH: 760,
	MAP_HEIGHT: 600,
	MAP_OUTER_TILEW: 19, // - 2 for border and dodgeball area
	MAP_OUTER_TILEH: 15,
	
	MAP_INNER_TILEW: 15,
	MAP_INNER_TILEH: 11,
	
	// tile width/height should be same as the tile set we use, see SpriteDefinitions.js
	MAP_TILEWIDTH: 40,
	MAP_TILEHEIGHT: 40,
	
	MAP_PROPORTION_DESTRUCTIBLE: 0.9,
	
	Z_FLOOR: 1,
	Z_POWERUP: 2,
	Z_DESTRUCTIBLE:3,
	Z_INDESTRUCTIBLE:4,
	Z_FIRE: 5,
	Z_EGG: 6,
	Z_FIREBALL: 7,
	Z_DRAGON: 8,
	
	// 4 corner spawn positions
	SPAWN_POSITIONS: [[0, 0], [14, 0], [0, 10], [14, 10]],
	// 2 of each powerup
	POWERUPS: [	Entities.POWERUP_KICK, Entities.POWERUP_KICK,
				Entities.POWERUP_SPEED, Entities.POWERUP_SPEED, 
				Entities.POWERUP_BLAST, Entities.POWERUP_BLAST,
				Entities.POWERUP_EGGLIMIT, Entities.POWERUP_EGGLIMIT ], 
	
	_spawnPositions: undefined,
	_powerups: undefined,
	
	_instance: undefined,
};

/*
 * Map.generate
 * @param mapData contains name, height, width and tiles of a map, sent from server
 * mapData.name can be specified to generate maps using different tilesets (specified in SpriteDefinitions)
 */
Map.generate = function(mapData)
{
	Map._spawnPositions = Map.SPAWN_POSITIONS.slice();
	Map._powerups = Map.POWERUPS.slice();

	var map = Entities.Map(mapData.name);
	Map._instance = map;
	
	for (var dy = 0; dy < mapData.height; dy++)
	{
		for (var dx = 0; dx < mapData.width; dx++)
		{
			var tile = mapData.tiles[ dy * mapData.width + dx ];

			switch ( tile )
			{
				case 0: // outermost border for dodge ballers
					map.attach(
						Entities.FloorTile().attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_FLOOR }));
					break;

				case 1: // floor with destructible tile
					map.attach(
						Entities.FloorTile().attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_FLOOR }));
					map.attach(
						Entities.DestructibleBlock().attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_DESTRUCTIBLE }));
					break;

				case 2: // wall to separate dodge ballers or indestructible blocks in every other tile
					map.attach(
		    			Entities.SolidBlock().attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_INDESTRUCTIBLE }));
					break;

				default:
					break;
			}
		}
	}
	
	// center the map
	map.shift(0.5*(Properties.DEVICE_WIDTH - Map.MAP_WIDTH), 0);

	/*
	var powerup_positions = [];
	// spawn powerups
	while (Map._powerups.length > 0)
	{
		console.log(Map._powerups.length);
		var powerup_type = Map._powerups.splice(0, 1)[0];
		console.log(powerup_type)
		
		do 
		{
			// roll unique position
			var pos = Crafty.math.randomInt(0, 116);
			var x = pos % 13 + 1;
			var y = parseInt(pos / 13) + 1;
			
		} while (powerup_positions.indexOf(pos) > 0 || ((x % 2 !== 0) && (y % 2 !== 0)))
		
		Map.spawnPowerup(powerup_type, x, y);
	}
	*/
	
	return map;
};

function _isBorder(x, y){
	// border is the extent of the entire map
	return x === 0 || x === (Map.MAP_OUTER_TILEW-1) || y === 0 || y === (Map.MAP_OUTER_TILEH-1);
};

function _isWall(x, y){
	// wall separates the regular playable inner area from the dodgeball area
	return x === 1 || x === (Map.MAP_OUTER_TILEW-2) || y === 1 || y === (Map.MAP_OUTER_TILEH-2);
};

Map.spawnPlayer = function(color)
{
	var player = Entities.Dragon(color);
	// get a unique spawn position
	//var tileSpawnPos = Map._spawnPositions.splice(Crafty.math.randomInt(0, Map._spawnPositions.length-1), 1)[0];
	var tileSpawnPos = Map._spawnPositions[ color ]; // temporarily fix corner for each color
	player.attr(Map.tileToPixel({ x: tileSpawnPos[0], y: tileSpawnPos[1] }));
	player.z = Map.Z_DRAGON;
	// checks the player's proximity for destructible blocks, remove them if spawning player there
	var destructibles = Crafty("Destructible");
	for (var i = 0; i < destructibles.length; i ++)
	{
		var block = Crafty(destructibles[i]);
		var blockPos = Map.pixelToTile({x: block.x, y: block.y});
		if (Math.abs(blockPos.x - tileSpawnPos[0]) <= 1 && Math.abs(blockPos.y - tileSpawnPos[1]) <= 1)
			block.destroy();
	}
	
	player.addComponent(EntityDefinitions.POWERUP_KICK);
	return player;
}

Map.spawnEgg = function(dragon)
{
	// spawn egg on the dragon making the egg
	var tile = Map.pixelToTile({ x: dragon.x, y: dragon.y });
	var egg = Entities.Egg(dragon).attr(Map.tileToPixel(tile)); 
	egg.z = Map.Z_EGG;
	return egg;
}

Map.spawnPowerup = function(type, x, y)
{
	var powerup = Entities.Powerup(type).attr(Map.tileToPixel({ x: x, y: y }));
	powerup.z = Map.Z_POWERUP;
	return powerup;
}

Map.suddenDeath = function()
{
	//TODO: ACTIVATE SUDDEN DEATH!!!!
}

Map.pixelToTile = function(dict)
{
	// converts pixel coordinates in dict to tile coordinates
	return {x: Math.floor((dict.x - Map._instance.x + Map.MAP_TILEWIDTH/2) / Map.MAP_TILEWIDTH - 2), 
			y: Math.floor((dict.y + Map.MAP_TILEHEIGHT/2) / Map.MAP_TILEHEIGHT - 2)};
}

Map.tileToPixel = function(dict)
{
	// converts tile coordinates in dict to pixel coordinates 
	return {x: (dict.x + 2) * Map.MAP_TILEWIDTH + Map._instance.x,
			y: (dict.y + 2) * Map.MAP_TILEHEIGHT};
}