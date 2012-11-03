/*
 * SpriteDefinitions.js
 * @author: Leon Ho
 * @author: Natalie
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
	
	BLUE: 'blue',
	GREEN: 'green',
	RED: 'red',
	PINK: 'pink',
	
	DRAGONS: ['bluedragon', 'greendragon', 'reddragon', 'pinkdragon'],
	COLORS: ['blue', 'green', 'red', 'pink'], // follows order on the spritesheet
	
	MAP_1: 'map1',
	
	GUI: 'gui',
};

for (var i = 0; i < SpriteDefinitions.COLORS.length; i++)
{
	var color = SpriteDefinitions.COLORS[i];
	SpriteDefinitions[color] = {
		'file': '/img/sprite40x40.png',
		'tile': SpriteDefinitions.TILE_WIDTH,
		'elements':(function() {
			var elements = {};
			elements[color + 'dragon'] = [5, i];
			elements[color + 'egg'] = [10, i];
			// temporary
			elements['fire'] = [10, 2];
			return elements;
		})(),
		'anim_walk_up':[[0, i], [1, i]],
		'anim_walk_right':[[2, i], [3, i], [4, i]],
		'anim_walk_down':[[5, i], [6, i]],
		'anim_walk_left':[[9, i], [8, i], [7, i]],
	};
}

SpriteDefinitions['map1'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'elements': {
		floor: [0, 4],
		tileD: [1, 4],
		tileI: [2, 4],
	}
};

SpriteDefinitions['gui'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'elements': {
		dpad: [0, 4],
		buttonA: [1, 4],
		buttonB: [2, 4],
	}
};

SpriteDefinitions['powerup'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'elements': {
		kick: [],
		blast: [],
		egg: [],
		speed: [],
	}
};
