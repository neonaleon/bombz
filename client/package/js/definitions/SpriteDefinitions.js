/*
 * SpriteDefinitions.js
 * @author: Leon Ho
 * define as such
 * 'spritename': {
 * 		'file': 'filename',
 * 		'tile': tileWidth,
 * 		'tileh': tileHeight // if undefined, 'tile' tileWidth will be used for tileHeight i.e. tile width and height is equal
 * 		'elements': {
 * 			element1: [0, 0],
 * 		}
 * 	}
 * 
 * NOTE: currently just use fixed 'tile'x'tile' sprite sheets
 */

var SpriteDefinitions = {
	
	TILE_WIDTH: 40,
	TILE_HEIGHT: 40,
	
	BLUE_DRAGON: 'bluedragon',
	GREEN_DRAGON: 'greendragon',
	RED_DRAGON: 'reddragon',
	PINK_DRAGON: 'pinkdragon',
	
	DRAGONS: ['bluedragon', 'greendragon', 'reddragon', 'pinkdragon'],
	
	MAP_1: 'map1',
};

for (var i = 0; i < SpriteDefinitions.DRAGONS.length; i++)
{
	var dragon = SpriteDefinitions.DRAGONS[i];
	SpriteDefinitions[dragon] = {
		'file': '/img/sprite40x40.png',
		'tile': SpriteDefinitions.TILE_WIDTH,
		'tileh': undefined,
		'elements':(function() {
			var elements = {};
			elements[dragon] = [5, i];
			elements['egg'] = [10, i];
			return elements;
		})(),
		'anim_walk_up':[[0, i], [1, i]],
		'anim_walk_right':[[2, i], [3, i], [4, i]],
		'anim_walk_down':[[5, i], [6, i]],
		'anim_walk_left':[[7, i], [8, i], [9, i]],
	};
}

SpriteDefinitions['map1'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'tileh': undefined,
	'elements': {
		floor: [0, 4],
		tileD: [1, 4],
		tileI: [2, 4],
	}
};