
var Map = {
	MAP_WIDTH: 1000,
	MAP_HEIGHT: 600,
	MAP_HORIZONTAL_TILE_COUNT: 30,
	MAP_VERTICAL_TILE_COUNT: 24,
	MAP_TILEWIDTH: 25,
	MAP_TILEHEIGHT: 25,
};

Map.generate = function(map_name)
{
	var map = Sprite.Map(map_name);
	
	map.attr( { x: 0.5*(Properties.DEVICE_WIDTH - Map.MAP_WIDTH), y: 0} );
	
	for (var dx = 0; dx < Map.MAP_HORIZONTAL_TILE_COUNT; dx++)
	{
		for (var dy = 0; dy < Map.MAP_VERTICAL_TILE_COUNT; dy++)
		{
			map.attach(
				Crafty.e("2D, DOM, floor")
            		.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: 1 }));
		    // border blocks
		    if (dx === 0 || dx === (Map.MAP_HORIZONTAL_TILE_COUNT-1) || dy === 0 || dy === (Map.MAP_VERTICAL_TILE_COUNT-1)) {
		    	map.attach(
		    		Crafty.e("2D, DOM, solid, tileI")
						.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: 5 }));
		    }
		    // indestructible blocks
		    if ((dx % 2 === 0) && (dy % 2 === 0))
		    {
		    	map.attach(
		    		Crafty.e("2D, DOM, solid, tileD")
						.attr({ x: dx * Map.MAP_TILEWIDTH, y: dy * Map.MAP_TILEHEIGHT, z: 4 }));
		    }
		}
	}
	
	return map;
};
