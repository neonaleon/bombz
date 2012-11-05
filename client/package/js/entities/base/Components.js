/*
 * Components.js
 * @author: Leon Ho
 * Contains components that are involved in game logic.
 * Generally used for creating our game entities in Entities.js
 */
var Components = {};

/*
 * @comp Dragon
 * This component defines the behavior the dragons.
 * This is also essentially the player's state.
 */
Crafty.c('Dragon', {
	init: function(){
		this.onEgg = false;
		this.blastRadius = 3;
		this.moveSpeed = 5;
		this.eggLimit = 3;
		this.canKick = false;
		this.eggCount = 0;
		this.health = 3;
		this.powerups = [];
		this.dead = false;
		
		this.bind('NewComponent', function(component){
			// if a controllable component was added to this player
			if ('Controllable' in this.__c)
			{
				this.bind('Moved', function(oldpos){
					this.x = oldpos.x + (this.x - oldpos.x) * this.moveSpeed;
					this.y = oldpos.y + (this.y - oldpos.y) * this.moveSpeed;
				});
				this.bind('KeyDown', function(keyEvent){
					if (keyEvent.key == Crafty.keys['A'])
						this.layEgg();
					if (keyEvent.key == Crafty.keys['B'])
						this.spitFireball();
				});
				this.unbind('NewComponent');
			}
		});
		return this;
	},
	loseHealth: function(){
		this.health -= 1;
		if (this.health == 0)
		{
			this.dead = true;
			this.destroy(); // temp TODO: shift player to dodgeball area
		}
		console.log("lose health: " + this.health);
	},
	layEgg: function(){
		if (!this.onEgg && this.eggCount < this.eggLimit)
		{
			this.eggCount += 1;
			console.log("planted: " + this.eggCount);
			Map.spawnEgg(this);
		};
	},
	spitFireball:function(){
		console.log("SPIT FIRE!");
	},
	clearEgg: function(){
		this.eggCount -= 1;
		console.log("exploded: " + this.eggCount);
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
 * @event explode
 * @event exploded
 */
Crafty.c('Egg', {
	init: function(){
		this.owner = undefined;
		this.bind('explode', this.explode);
		return this;
	},
	explode: function(){
		Crafty.audio.play(AudioDefinitions.EXPLODE);

		this.removeComponent('Burnable', false);

		var eggPos = Map.pixelToTile({x: this.x, y: this.y});

		var directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
		for (var i = 0; i < 4; i++)
		{
			var dir = directions[i];
			for (var j = (i === 0) ? 0 : 1; j < this.blastRadius; j++)
			{
				var fire = Crafty.e('Fire').fire(500);
				fire.z = Map.Z_FIRE;
				fire.attr(Map.tileToPixel({ x: eggPos.x + j*dir[0], y: eggPos.y + j*dir[1]}));
				if (fire.hit('Burnable')) { fire.hit('Burnable')[0].obj.trigger('burn'); break; };
				if (fire.hit('solid')) { fire.destroy(); break; };
			}
		}
		this.owner.clearEgg();
		this.destroy();
	},
	egg: function(blastRadius, fuseTime){
		this.blastRadius = blastRadius;
		this.timeout(function(){ this.trigger('explode'); }, fuseTime);
		return this;
	},
});

/*
 * @comp Fire
 * 
 */
Crafty.c('Fire', {
	init: function(){
		var def = SpriteDefinitions['effects'];
		Crafty.sprite(SpriteDefinitions['effects']);
		this.requires(Properties.RENDERER + ", 2D, SpriteAnimation, Collision, fire");
		this.animate("fire_explode", def['anim_fire']);
		this.bind("EnterFrame", function (newdir) {
			if (!this.isPlaying("fire_explode")) this.stop().animate("fire_explode", 3, 1);
        })
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
	powerup: function(type){
		return this;
	},
	apply: function(){
		
	},
	unapply: function(){
		
	},
});

/*
 * @comp Fireball
 */
Crafty.c('Fireball', {
	init: function(){
		return this;
	},
	fireball: function(){
		return this;
	},
});

/*
 * @comp Destructible
 * This component is used by Map only for searching
 */
Crafty.c('Destructible', {
	init: function(){
		return this;
	},
});

/*
 * @comp Burnable
 * Entities that have a burnable component should bind to 'burn' event
 * The 'burn' event occurs when the entity is hit by @comp fire
 */
Crafty.c('Burnable', {
	init: function(){
		return this;
	},
});


