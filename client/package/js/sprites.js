
/*	Sprite definitions
*	define as such
*	'spritename': {
*		'file': 'filename',
*		'tile': tileWidth,
*		'tileh': tileHeight // if undefined, 'tile' tileWidth will be used for tileHeight i.e. tile width and height is equal
*		'elements': {
*			element1: [0, 0],
*		}
*	}
*/
Sprites = {
	'tileset': {
		'file': '/img/sprite.png',
		'tile': 25,
		'tileh': undefined,
		'elements': {
			floor: [0, 4],
			tileD: [1, 4],
			tileI: [2, 4],
			player1u1: [0, 0],
			player1u2: [1, 0],
			player1r1: [2, 0],
			player1r2: [3, 0],
			player1r3: [4, 0],
			player1d1: [5, 0],
			player1d2: [6, 0],
			player1l1: [7, 0],
			player1l2: [8, 0],
			player1l3: [9, 0],
			player1bomb: [10, 0],
			player2u1: [0, 1],
			player2u2: [1, 1],
			player2r1: [2, 1],
			player2r2: [3, 1],
			player2r3: [4, 1],
			player2d1: [5, 1],
			player2d2: [6, 1],
			player2l1: [7, 1],
			player2l2: [8, 1],
			player2l3: [9, 1],
			player2bomb: [10, 1],
			player3u1: [0, 2],
			player3u2: [1, 2],
			player3r1: [2, 2],
			player3r2: [3, 2],
			player3r3: [4, 2],
			player3d1: [5, 2],
			player3d2: [6, 2],
			player3l1: [7, 2],
			player3l2: [8, 2],
			player3l3: [9, 2],
			player3bomb: [10, 2],
			player4u1: [0, 3],
			player4u2: [1, 3],
			player4r1: [2, 3],
			player4r2: [3, 3],
			player4r3: [4, 3],
			player4d1: [5, 3],
			player4d2: [6, 3],
			player4l1: [7, 3],
			player4l2: [8, 3],
			player4l3: [9, 3],
			player4bomb: [10, 3],
		}
	}
};

Sprites.create = function(spritename) {
	if (spritename != undefined) {
		var spriteDef = this[spritename];
		if (spriteDef['tileh'] == undefined)
			Crafty.sprite(spriteDef['tile'], spriteDef['file'], spriteDef['elements']);
		else
			Crafty.sprite(spriteDef['tile'], spriteDef['tileh'], spriteDef['file'], spriteDef['elements']);
		return;
	}

	for (var eachSpriteName in this) {
		var eachSpriteDef = this[eachSpriteName];
		if (eachSpriteDef['tileh'] == undefined)
			Crafty.sprite(eachSpriteDef['tile'], eachSpriteDef['file'], eachSpriteDef['elements']);
		else
			Crafty.sprite(eachSpriteDef['tile'], eachSpriteDef['tileh'], eachSpriteDef['file'], eachSpriteDef['elements']);
	}
};
