/*
 * AudioDefinitions
 * @author: Leon Ho
 * This file is used to add audio assets to Crafty for use in the game.
 * In the game components, use Crafty.audio.play(AudioDefinitions.SOME_ENUM, [repeatCount], [volume]) to play the audio.
 */

var AudioDefinitions = {
	EXPLODE: "explode",
	KICK: "kick",
	EGG: "egg",
	POWERUP: "powerup",
	DEATH: "death",
	FIREBALL: "fireball",
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
	"snd/drop.wav",
])
Crafty.audio.add(AudioDefinitions.POWERUP, [
	"snd/powerup.wav",
])
Crafty.audio.add(AudioDefinitions.DEATH, [
	"snd/die.wav",
])
Crafty.audio.add(AudioDefinitions.FIREBALL, [
	"snd/fireball.wav",
])