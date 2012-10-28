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
	
	MAP_1: 'map1',
};

SpriteDefinitions['bluedragon'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'tileh': undefined,
	'animRow': 0,
	'animCol': undefined,
	'elements':{
		bluedragon: [0, 0],
		egg: [10, 0],
	}
};

SpriteDefinitions['greendragon'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'tileh': undefined,
	'animRow': 1,
	'animCol': undefined,
	'elements':{
		greendragon: [0, 1],
		egg: [10, 1],
	}
};

SpriteDefinitions['reddragon'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'tileh': undefined,
	'animRow': 2,
	'animCol': undefined,
	'elements':{
		reddragon: [0, 2],
		egg: [10, 2],
	}
};

SpriteDefinitions['pinkdragon'] = {
	'file': '/img/sprite40x40.png',
	'tile': SpriteDefinitions.TILE_WIDTH,
	'tileh': undefined,
	'animRow': 3,
	'animCol': undefined,
	'elements':{
		pinkdragon: [0, 0],
		egg: [10, 3],
	}
};

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