﻿
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
			tileI: [0, 0],
			tileD: [1, 0],
			player1: [0, 1],
			floor: [2, 0],
			bomb: [3, 0]
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
