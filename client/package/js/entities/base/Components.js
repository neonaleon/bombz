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
		//this.requires("SpriteAnimation, Collision");
		
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
		this.requires('solid');
		
		this.blastRadius = 3;
		
		this.bind('explode', function(){
			Crafty.audio.play(AudioDefinitions.EXPLODE);
			
			this.removeComponent('Egg', false);
			
			var eggPos = Map.pixelToTile({x: this.x, y: this.y});
			
			var directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
			for (var i = 0; i < 4; i++)
			{
				var dir = directions[i];
				for (var j = 1; j < this.blastRadius; j++)
				{
					var fire = Crafty.e('Fire').fire(500);
					fire.z = Map.Z_FIRE;
					fire.attr(Map.tileToPixel({ x: eggPos.x + j*dir[0], y: eggPos.y + j*dir[1]}));
					if (fire.hit('Egg')) { fire.hit('Egg')[0].obj.trigger('explode'); break; };
					if (fire.hit('Burnable')) { fire.hit('Burnable')[0].obj.trigger('burn'); break; };
					if (fire.hit('solid')) { fire.destroy(); break; };
				}
			}
			
			this.destroy();
		});
		
		return this;
	},
});

/*
 * @comp Fire
 */
Crafty.c('Fire', {
	init: function(){
		this.requires(Properties.RENDERER + ", 2D, fire, Collision");
		return this;
	},
	// lifetime specifies how long the fire lasts (or how long the animation runs)
	fire: function(lifetime){ 
		this.timeout(function(){ this.destroy(); }, lifetime);
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

/*
 * @comp Destructible
 */
Crafty.c('Destructible', {
	init: function(){
		return this;
	},
});

/*
 * @comp Burnable
 */
Crafty.c('Burnable', {
	init: function(){
		this.bind('burn', function(){
			this.destroy();
		});
		return this;
	},
});


