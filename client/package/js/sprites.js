
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
		'tile': 16,
		'tileh': undefined,
		'elements': {
			grass1: [0, 0],
			grass2: [1, 0],
			grass3: [2, 0],
			grass4: [3, 0],
			flower: [0, 1],
			bush1: [0, 2],
			bush2: [1, 2],
			player: [0, 3],
			enemy: [0, 3],
			banana: [4, 0],
			empty: [4, 0],
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
