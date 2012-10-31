/*
 * Components.js
 * Contains components that are involved in game logic.
 * Generally used for creating our game entities in Entities.js
 * @author: Leon Ho
 */


Crafty.c('EggLayer', {
	init: function(){
			
	},
	
});

Crafty.c('Powerup', {
	init: function(){
		
	},
});

/*
 * @comp Bomb
 * This component defines the behavior of the bomb.
 * The variables movable, fuseTime, blastRadius are instance variables. 
 */
Crafty.c('Bomb', {
	init: function(){
		this.movable = false;
		this.fuseTime = 2000;
		this.blastRadius = 3;
		
		this.bind('explode', function(){
			
		});
	},
});





