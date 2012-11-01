/*
 * Components.js
 * Contains components that are involved in game logic.
 * Generally used for creating our game entities in Entities.js
 * @author: Leon Ho
 */
var Components = {};

/*
 * @comp Dragon
 * This component defines the behavior of the players, the dragons.
 * 
 */
Crafty.c('Dragon', {
	init: function(){
		return this;
	},
	dragon: function(color){
		this.color = color;
		return this;
	},
});

/*
 * @comp Egg
 * This component defines the behavior of the explosive eggs.
 * The variables movable, fuseTime, blastRadius are instance variables. 
 */
Crafty.c('Egg', {
	init: function(){
		this.movable = false;
		this.fuseTime = 2000;
		this.blastRadius = 3;
		
		this.bind('explode', function(){
			Crafty.audio.play(AudioDefinitions.EXPLODE);
			this.destroy();
		});
		
		return this;
	},
});

/*
 * @comp Powerup
 */
Crafty.c('Powerup', {
	init: function(){
		return this;
	},
});

/*
 * @comp Fireball
 */
Crafty.c('Fireball', {
	init: function(){
		return this;
	},
});


