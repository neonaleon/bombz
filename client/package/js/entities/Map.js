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
	Z_BURNING: 6,
	Z_EGG: 7,
	Z_FIREBALL: 8,
	Z_DRAGON: 9,
	
	// 4 corner spawn positions
	SPAWN_POSITIONS: [[0, 0], [14, 0], [0, 10], [14, 10]],
	
	SUDDEN_DEATH_RATE: 300, // number of millis between spawning each block
	
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
				if (!(dy==0 || dy==mapData.height-1 || dx==0 || dx==mapData.width-1) )
					map.attach(
						Entities.FloorTile().attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_FLOOR }));
				else
					map.attach(
						Entities.DodgeBallBlock().attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_FLOOR }));
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
					// map.attach(
		   //  			Entities.SolidBlock().attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: Map.Z_INDESTRUCTIBLE }));
					break;
			}
		}
	}
	
	// center the map
	map.shift(0.5*(Properties.DEVICE_WIDTH - Map.MAP_WIDTH), 0);
	
	// build the 4 extents
	// // left
	// Entities.Extents().color("#000000").attr({w: 0.5*(Properties.DEVICE_WIDTH - Map.MAP_WIDTH), h: Properties.DEVICE_HEIGHT, x: 0, y: 0});
	map.attach(
		Entities.Sidebar().attr({ x: 0, y: 0, z: Map.Z_INDESTRUCTIBLE }));
	// // right
	// Entities.Extents().color("#000000").attr({w: 0.5*(Properties.DEVICE_WIDTH - Map.MAP_WIDTH), h: Properties.DEVICE_HEIGHT, x: map.x + Map.MAP_WIDTH, y: 0});
	map.attach(
		Entities.Sidebar().attr({x: map.x + Map.MAP_WIDTH, y: 0, z: Map.Z_INDESTRUCTIBLE }));
	// top
	Entities.Extents().color("#000000").attr({w: Properties.DEVICE_WIDTH, h: 10, x: 0, y: -10});
	// bottom
	Entities.Extents().color("#000000").attr({w: Properties.DEVICE_WIDTH, h: 10, x: 0, y: Properties.DEVICE_HEIGHT});
	
	// TODO: test
	/*
	Map.spawnPowerup(EntityDefinitions.POWERUP_KICK, 5, 0);
	Map.spawnPowerup(EntityDefinitions.POWERUP_BLAST, 1, 0);
	Map.spawnPowerup(EntityDefinitions.POWERUP_SPEED, 3, 0);
	Map.spawnPowerup(EntityDefinitions.POWERUP_EGGLIMIT, 2, 0);
	*/
	var powerups = mapData.powerups;
	for (var i = 0; i < powerups.length; i++)
	{
		var powerup = powerups[i];
		//_powerups[ powerup.id ] = powerup;
		Map.spawnPowerup( EntityDefinitions.POWERUP_SPRITES[ powerup.type ], powerup.x , powerup.y );	
	}
	
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

Map.spawnEggOnTile = function(dragon, tile)
{
	// spawn egg on the dragon making the egg
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

Map.movePlayerOutside = function(dragon)
{
	// actually this spawning code can be used for spawning fireballs as well hmm.
	var pos = {x:0, y:0};
	if (Math.random() > 0.5)
	{
		pos.x = (Math.random() > 0.5) ? 0 : Map.MAP_OUTER_TILEW - 1; // left or right
		pos.y = Math.floor(Math.random()*(Map.MAP_OUTER_TILEH - 1)); 
	}
	else
	{
		pos.x = Math.floor(Math.random()*(Map.MAP_OUTER_TILEW - 1));
		pos.y = (Math.random() > 0.5) ? 0 : Map.MAP_OUTER_TILEH - 1; // top or bottom
	}
	Map._movePlayerOutside(dragon, pos);
}
// modify and use this when using server (refer to above function)
Map._movePlayerOutside = function(dragon, pos)
{
	dragon.x = pos.x * Map.MAP_TILEWIDTH + Map._instance.x;
	dragon.y = pos.y * Map.MAP_TILEHEIGHT;
}

Map.suddenDeath = function()
{
	defer_spawn_block(0, 14, 10, 0, 0, 0, Map.SUDDEN_DEATH_RATE);
}
function defer_spawn_block(up, right, down, left, row, col, delay)
{
	spawn_sd_block(col, row);
	// 0-14 in columns, 0-10 in rows	
	setTimeout(function() {
		if (row == up && col != right) 
		{
			col += 1;
			if (col == right) up += 1;
		}
		else if (col == right && row != down)
		{
			row += 1;
			if (row == down) right -= 1;
		}
		else if (row == down && col != left)
		{
			col -= 1;
			if (col == left) down -= 1;
		}
		else if (col == left && row != up)
		{
			row -= 1;
			if (row == up) left += 1;
		}
		if (!(up == 6 && right == 9 && down == 4 && left == 5)) defer_spawn_block(up, right, down, left, row, col, delay);
		else console.log("END");
	}, delay); 
}
function spawn_sd_block(x, y)
{
	var tile = Map.tileToPixel({x: x, y: y});
	tile.z = Map.Z_INDESTRUCTIBLE;
	Entities.SDBlock().attr(tile);
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