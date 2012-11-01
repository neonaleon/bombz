

var AudioDefinitions = {
	EXPLODE: "explode",
	KICK: "kick",
	EGG: "egg",
};

/*
 *  Crafty example:
 *  Cross browser support needs all 3 formats
 *	Crafty.audio.add("walk", [
 *		"sounds/walk.mp3",
 *		"sounds/walk.ogg",
 *		"sounds/walk.wav"
 *	]);
 */
Crafty.audio.add(AudioDefinitions.EXPLODE, [
	"snd/explode.wav",
])

Crafty.audio.add(AudioDefinitions.KICK, [
	"snd/kick.wav",
])
Crafty.audio.add(AudioDefinitions.EGG, [
	"snd/layegg.wav",
])

