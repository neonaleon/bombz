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


SpriteDefinitions = {
	
	TILE_WIDTH: 25,
	TILE_HEIGHT: 25,
	
	BLUE_DRAGON: 'bluedragon',
	GREEN_DRAGON: 'greendragon',
	RED_DRAGON: 'reddragon',
	PINK_DRAGON: 'pinkdragon',
	
	MAP_1: 'map1',
	
	'bluedragon':{
		'file': '/img/sprite.png',
		'tile': this.TILE_WIDTH,
		'tileh': undefined,
		'animRow': 0,
		'animCol': undefined,
		'elements':{
			defaultSprite: [0, 0],
			u0: [0, 0],
			u1: [1, 0],
			r0: [2, 0],
			r1: [3, 0],
			r2: [4, 0],
			d0: [5, 0],
			d1: [6, 0],
			l0: [7, 0],
			l1: [8, 0],
			l2: [9, 0],
			egg: [10, 0],
		}
	},
	
	'greendragon':{
		'file': '/img/sprite.png',
		'tile': this.TILE_WIDTH,
		'tileh': undefined,
		'animRow': 1,
		'animCol': undefined,
		'elements':{
			defaultSprite: [0, 0],
			u0: [0, 1],
			u1: [1, 1],
			r0: [2, 1],
			r1: [3, 1],
			r2: [4, 1],
			d0: [5, 1],
			d1: [6, 1],
			l0: [7, 1],
			l1: [8, 1],
			l2: [9, 1],
			egg: [10, 1],
		}
	},
	
	'reddragon':{
		'file': '/img/sprite.png',
		'tile': this.TILE_WIDTH,
		'tileh': undefined,
		'animRow': 2,
		'animCol': undefined,
		'elements':{
			defaultSprite: [0, 0],
			u0: [0, 2],
			u1: [1, 2],
			r0: [2, 2],
			r1: [3, 2],
			r2: [4, 2],
			d0: [5, 2],
			d1: [6, 2],
			l0: [7, 2],
			l1: [8, 2],
			l2: [9, 2],
			egg: [10, 2],
		}
	},
	
	'pinkdragon':{
		'file': '/img/sprite.png',
		'tile': this.TILE_WIDTH,
		'tileh': undefined,
		'animRow': 3,
		'animCol': undefined,
		'elements':{
			defaultSprite: [0, 0],
			u0: [0, 3],
			u1: [1, 3],
			r0: [2, 3],
			r1: [3, 3],
			r2: [4, 3],
			d0: [5, 3],
			d1: [6, 3],
			l0: [7, 3],
			l1: [8, 3],
			l2: [9, 3],
			egg: [10, 3],
		}
	},
	
	'map1': {
		'file': '/img/sprite.png',
		'tile': 25,
		'tileh': undefined,
		'elements': {
			floor: [0, 4],
			tileD: [1, 4],
			tileI: [2, 4],
		}
	}
};