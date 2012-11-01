/*
 * Components.js
 * Contains components that are involved in game logic.
 * Generally used for creating our game entities in Entities.js
 * @author: Leon Ho
 */
var Components = {};

Crafty.c('Dragon', {
	init: function(){
		
	},
	dragon: function(color){
		this.color = color;
		return this;
	},
});

Crafty.c('Powerup', {
	init: function(){
		
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
			this.destroy();
		});
	},
});





