
var Map = {
	MAP_WIDTH: 760,
	MAP_HEIGHT: 600,
	MAP_HORIZONTAL_TILE_COUNT: 19, // - 2 for border and dodgeball area
	MAP_VERTICAL_TILE_COUNT: 15,
	
	// tile width/height should be same as the tile set we use, see SpriteDefinitions.js
	MAP_TILEWIDTH: 40,
	MAP_TILEHEIGHT: 40,
	
	instance: undefined,
};

Map.generate = function(map_name)
{	
	var map = Sprite.Map(map_name);
	
	for (var dx = 0; dx < Map.MAP_HORIZONTAL_TILE_COUNT; dx++)
	{
		for (var dy = 0; dy < Map.MAP_VERTICAL_TILE_COUNT; dy++)
		{
			map.attach(
				Crafty.e("2D, DOM, floor")
            		.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: 1 }));
		    // border blocks
		    if (_isBorder(dx, dy)) {
		    	map.attach(
		    		Crafty.e("2D, DOM, solid, tileI")
						.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: 5 }));
		    }
		    else // indestructible blocks in every other tile
		    if ((dx % 2 === 0) && (dy % 2 === 0))
		    {
		    	map.attach(
		    		Crafty.e("2D, DOM, solid, tileD")
						.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: 4 }));
		    }
		}
	}
	// center the map
	map.shift(0.5*(Properties.DEVICE_WIDTH - Map.MAP_WIDTH), 0);
	
	Map.instance = map;
	
	return map;
};

function _isBorder(x, y){
	return x === 0 || x === (Map.MAP_HORIZONTAL_TILE_COUNT-1) || y === 0 || y === (Map.MAP_VERTICAL_TILE_COUNT-1);
};

Map.spawnPlayer = function(type, posx, posy)
{
	var player = Sprite.Dragon(type);
<<<<<<< HEAD
	player.attr({ x: 200, y: 40, z: 100});
=======
	Map.instance.attach(player);
	player.attr({ x: Map.instance.x + Map.MAP_TILEWIDTH, y: Map.MAP_TILEHEIGHT, z: 100});
>>>>>>> dbbc1f055fd4e13eb16ae3f350cfd63b7d7f0a86
	return player;
}




