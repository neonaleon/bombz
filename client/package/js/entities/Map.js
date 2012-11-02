
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
	
	_spawnPositions: [[0, 0], [14, 0], [0, 10], [14, 10]],
	
	_instance: undefined,
};

/*
 * Map.generate
 * @param map_name the name of the map to generate
 * map_name can be specified to generate maps using different tilesets (specified in SpriteDefinitions)
 */
Map.generate = function(map_name)
{	
	var map = Entities.Map(map_name);
	
	for (var dx = 0; dx < Map.MAP_OUTER_TILEW; dx++)
	{
		for (var dy = 0; dy < Map.MAP_OUTER_TILEH; dy++)
		{
			// outermost border for dodge ballers
			if (_isBorder(dx, dy))
			{
				map.attach(
					Crafty.e("2D, DOM, floor")
	            		.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_FLOOR }));
	        }
	        // wall to separate dodge ballers
	        // or indestructible blocks in every other tile
	        else if (_isWall(dx, dy) || ((dx % 2 !== 0) && (dy % 2 !== 0)))
	        {
	        	map.attach(
		    		Crafty.e("2D, DOM, solid, tileI")
						.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_INDESTRUCTIBLE }));
	        }
		    // everything else is floor
		    else
		    {
		    	map.attach(
					Crafty.e("2D, DOM, floor")
	            		.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_FLOOR }));
	           	
	           	// with a chance to spawn a powerup (not yet implemented)
	            // or to spawn a destructible block
	            if (Crafty.math.randomNumber(0, 1) < Map.MAP_PROPORTION_DESTRUCTIBLE)
	            {
	            	map.attach(
						Crafty.e("2D, DOM, Destructible, Burnable, solid, tileD")
		            		.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_DESTRUCTIBLE }));
	            }
		    }
		}
	}
	// center the map
	map.shift(0.5*(Properties.DEVICE_WIDTH - Map.MAP_WIDTH), 0);
	
	Map._instance = map;
	
	return map;
};

// border is the extent of the entire map 
function _isBorder(x, y){
	return x === 0 || x === (Map.MAP_OUTER_TILEW-1) || y === 0 || y === (Map.MAP_OUTER_TILEH-1);
};

// wall separates the regular playable inner area from the dodgeball area
function _isWall(x, y){
	return x === 1 || x === (Map.MAP_OUTER_TILEW-2) || y === 1 || y === (Map.MAP_OUTER_TILEH-2);
};

Map.spawnPlayer = function(color)
{
	var player = Entities.Dragon(color);
	var tileSpawnPos = Map._spawnPositions[Crafty.math.randomInt(0, 3)];
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
	return player;
}

Map.spawnEgg = function(dragon)
{
	var egg = Entities.Egg(dragon.color).attr(Map.tileToPixel(Map.pixelToTile({ x: dragon.x, y: dragon.y })));
	egg.z = Map.Z_EGG;
	return egg;
}

Map.spawnPowerup = function(type, x, y)
{
	var powerup = undefined;
	console.log("spawnPowerup not yet implemented");
	return powerup;
}

// converts pixel coordinates to tile coordinates
Map.pixelToTile = function(dict)
{
	return {x: Math.floor((dict.x - Map._instance.x + Map.MAP_TILEWIDTH/2) / Map.MAP_TILEWIDTH - 2), 
			y: Math.floor((dict.y + Map.MAP_TILEHEIGHT/2) / Map.MAP_TILEHEIGHT - 2)};
}
// converts tile coordinates to pixel coordinates 
Map.tileToPixel = function(dict)
{
	return {x: (dict.x + 2) * Map.MAP_TILEWIDTH + Map._instance.x,
			y: (dict.y + 2) * Map.MAP_TILEHEIGHT};
}