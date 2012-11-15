/*
 * Components.js
 * @author: Leon Ho
 * @coauthor: Nat
 * Contains components that are involved in game logic.
 * Generally used for creating our game entities in Entities.js
 */
var Components = {};

/* ====================
 * Main game components
 ======================*/

/*
 * @comp Dragon
 * This component defines the behavior the dragons.
 * This is also essentially the player's state.
 */
Crafty.c('Dragon', {
	init: function() {
		this.onEgg = false;
		this.blastRadius = 3;
		this.moveSpeed = 5;
		this.eggLimit = 3;
		this.canKick = false;
		this.eggCount = 0;
		this.health = 3;
		this.hasFireball = true;
		this.powerups = [];
		this.direction = undefined;

		this.lastUpdate = undefined;
		this.expectedPosition = undefined;
		
		// perform collision detection when the entity is being moved
		this.bind('Moved', function(oldpos)
		{
			this.x = oldpos.x + (this.x - oldpos.x) * this.moveSpeed;
			this.y = oldpos.y + (this.y - oldpos.y) * this.moveSpeed;
	
			if (this.onEgg && this.hit('Egg').length == 1)
        	{
        		if (this.hit('solid'))
            		this.attr(Map.tileToPixel(Map.pixelToTile({x: this.x, y:this.y}))); // snap to grid
        	}
        	else 
        	{
        		if (this.hit('solid') || this.hit('Egg'))
            	{
            		var egg = this.hit('Egg');
            		//TODO: KICK
            		// egg.trigger('kick');
            		//if (egg && this.has(EntityDefinitions.POWERUP_KICK + "_powerup"))
            		//	egg[0].obj.trigger('kicked', {x: this.x - oldpos.x, y: this.y - oldpos.y});
            		//this.x = oldpos.x;
            		//this.y = oldpos.y;
            		this.attr(Map.tileToPixel(Map.pixelToTile({x: this.x, y:this.y})));
            	}
        	}
		});	
		
		this.bind('NewComponent', function(component)
		{
			// if a controllable component was added to this dragon
			if ('Controllable' in this.__c)
			{
				this.bind('NewDirection', function(newdir){
					var direction;
					
					if (newdir.x < 0)
                        direction = Player.Direction.LEFT;
                    if (newdir.x > 0)
                        direction = Player.Direction.RIGHT;
                    if (newdir.y < 0)
                        direction = Player.Direction.UP;
                    if (newdir.y > 0)
                        direction = Player.Direction.DOWN;
                    if(!newdir.x && !newdir.y)
                    	direction = Player.Direction.NONE;

                    if ( this.direction === direction )
						return;

					// don't store direction if it is none, so we have the latest direction player is facing
					if ( direction !== Player.Direction.NONE )
                    	this.direction = direction;
                    this.trigger( "ChangeDirection", direction );

                    // TODO: DR
                    // currently sending update as long as direction changes
                    // want to make it so that only if successfully turn around the corner then send
                    // 1. spamming left - right
                    // 2. walking against solid blocks / walls
                    NetworkManager.SendMessage(MessageDefinitions.MOVE, { timestamp: WallClock.getTime(), x: this.x, y: this.y, dir: this.direction });
/*
                  	if ( direction === Player.Direction.NONE )
                    	NetworkManager.SendMessage(MessageDefinitions.MOVE, { x: this.x, y: this.y, dir: this.direction });
                    
=======
                    NetworkManager.SendMessage(MessageDefinitions.MOVE, { timestamp: WallClock.getTime(), x: this.x, y: this.y, dir: direction });
>>>>>>> 9b047dd8f2de4e014b1c9043a5e3cbd22cd3117b
*/
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
	dragon: function(color){
		this.color = color;
		return this;
	},
	loseHealth: function(){
		this.health -= 1;
		if (this.health == 0)
		{
			this.trigger('killed');
		}
		console.log("lose health: " + this.health);
	},
	layEgg: function(){
		if (!this.onEgg && this.eggCount < this.eggLimit)
		{
			this.eggCount += 1;
			//console.log("planted: " + this.eggCount);

			var data = Map.pixelToTile({x: this.x, y: this.y});
			data.timestamp = WallClock.getTime();
			NetworkManager.SendMessage(MessageDefinitions.BOMB, data);
			Map.spawnEgg(this);
		};
	},
	spitFireball:function(){
		console.log("SPIT FIRE!");
		if (this.hasFireball)
		{
			var pos = Map.tileToPixel(Map.pixelToTile({x: this.x, y: this.y}));
			pos.x += this.direction.x;
			pos.y += this.direction.y;
			Entities.Fireball().fireball(this.direction)
								.attr(pos);

			var data = Map.pixelToTile({x: this.x, y: this.y});
			data.direction = this.direction;
			data.timestamp = WallClock.getTime();
			NetworkManager.SendMessage(MessageDefinitions.FIREBALL, data);
		}	
	},
	clearEgg: function(){
		this.eggCount -= 1;
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
		this.bind('MouseDown', this.kick);
		this.bind('Moved', function(oldpos)
		{
			this.x = oldpos.x + (this.x - oldpos.x) * EntityDefinitions.EGG_MOVE_SPEED;
			this.y = oldpos.y + (this.y - oldpos.y) * EntityDefinitions.EGG_MOVE_SPEED;

			if (this.hit('solid') || this.hit('Egg'))
        	{
        		this.attr(Map.tileToPixel(Map.pixelToTile({x: this.x, y:this.y}))); // snap to grid
        	}
        });	
		return this;
	},
	kick: function(){
		if (this.owner.canKick) {
			this.x = oldpos.x + (this.x - oldpos.x) * EntityDefinitions.EGG_MOVE_SPEED;
			this.y = oldpos.y + (this.y - oldpos.y) * EntityDefinitions.EGG_MOVE_SPEED;

		}
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
		Crafty.sprite(def['tile'], def['file'], def['elements']);
		this.requires(Properties.RENDERER + ", 2D, SpriteAnimation, Collision, fire");
		this.animate("fire_explode", def['anim_fire']);
        this.bind("NewEntity", function(data){
        	// play once upon spawn
        	if (data.id == this[0] && !this.isPlaying("fire_explode")) this.stop().animate("fire_explode", 24, 1);
        });
		return this;
	},
	// lifetime specifies how long the fire lasts (or how long the animation runs)
	fire: function(lifetime){ 
		this.timeout(function(){ this.destroy(); }, lifetime);
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
	fireball: function(dir){
		this.bind("EnterFrame", function()
		{
			if (this.hit('Dragon'))
			{
				this.hit('Dragon')[0].obj.trigger('burn');
				this.destroy();
			}
			if (this.hit('Egg'))
			{
				this.hit('Egg')[0].obj.trigger('burn');
				this.destroy();
			}
			this.x += dir.x * EntityDefinitions.FIREBALL_MOVE_SPEED;
			this.y += dir.y * EntityDefinitions.FIREBALL_MOVE_SPEED;
		});
		return this;
	},
});

/* ============================
 * Collision related components
 ==============================*/

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

/* ==========================
 * Powerup related components
 ============================*/

/*
 * @comp Kickable
 * Entities that have a kickable component should bind to 'kicked' event
 * The 'kicked' event occurs when the entity is hit by @comp Dragon
 */
Crafty.c('Kickable', {
	init: function(){
		this.isMoving = false;

		this.bind('kicked', function(dir)
		{
			if (!this.isMoving)
			{
				this.isMoving = true;
				this.bind("EnterFrame", function()
				{
					if (this.hit('solid') || this.hit('Dragon') || this.hit('Egg'))
					{
						this.isMoving = false;
						// TODO: snap to map grid?
						//var collide = Map.tileToPixel(Map.pixelToTile({ x: this.x, y: this.y }));
						//this.x = collide.x;
						//this.y = collide.y;
						return;
					}
					if (this.isMoving)
					{
						this.x += dir.x * EntityDefinitions.EGG_MOVE_SPEED;
						this.y += dir.y * EntityDefinitions.EGG_MOVE_SPEED;
					}
				});
			}
		});
		return this;
	},
});

/*
 * @comp Powerup
 * this is the component that specifies a powerup that is placed on the map, and the GUI
 * the actual powerup effect is added to the dragon as a component
 */
Crafty.c('Powerup', {
	init: function(){
		this.id = undefined;
		this.type = undefined;
		return this;
	},
	powerup: function(type){
		this.type = type;
		this.bind("EnterFrame", function(){
			var hitDragon = this.hit('Dragon');
			if (hitDragon)
			{
				var dragon = hitDragon[0].obj;
				if (!dragon.has(this.type + "_powerup"))
				{
					// effects don't apply until message returns
					//dragon.addComponent(this.type + "_powerup");
					//dragon.trigger('applyPowerup');

					// send message to inform on collection
					var data = Map.pixelToTile( { x: this.x, y: this.y } );
					data.timestamp = WallClock.getTime();

					// only send update if local dragon
					if ('Controllable' in dragon.__c)
						NetworkManager.SendMessage(MessageDefinitions.POWERUP, data);

					this.destroy();
				}
			}
		});
		return this;
	},
});

/*
 * @comp kick
 * NOT USED
 */

Crafty.c(EntityDefinitions.POWERUP_KICK + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){
			this.canKick = true;
		});
		this.bind("unapplyPowerup", function(){ 
			this.canKick = false;
			this.removeComponent(EntityDefinitions.POWERUP_KICK); 
		});
		return this;
	},
});


/*
 * @comp speed
 */
Crafty.c(EntityDefinitions.POWERUP_SPEED + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){
			this.moveSpeed = 7.5; 
		});
		this.bind("unapplyPowerup", function(){ 
			this.moveSpeed = 5;
			this.removeComponent(EntityDefinitions.POWERUP_SPEED + "_powerup");
		});
		return this;
	},
});

/*
 * @comp blast
 */
Crafty.c(EntityDefinitions.POWERUP_BLAST + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){ this.blastRadius = 6; });
		this.bind("unapplyPowerup", function(){ 
			this.blastRadius = 3;
			this.removeComponent(EntityDefinitions.POWERUP_BLAST + "_powerup");
		});
		return this;
	},
});

/*
 * @comp egg_limit
 */
Crafty.c(EntityDefinitions.POWERUP_EGGLIMIT + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){ this.eggLimit = 6; });
		this.bind("unapplyPowerup", function(){ this.eggLimit = 3; });
		return this;
	},
});

Crafty.c(EntityDefinitions.POWERUP_FIREBALL + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){ this.hasFireball = true; });
		this.bind("unapplyPowerup", function(){});
		return this;
	}
})

/*=======================
 * Network related components
 ========================*/
Crafty.c("NetworkedPlayer", {
	init: function(){
		this.bind("network_update", function(data){
			console.log("network update", data);
			this.updateState(data);
		});
		this.bind("EnterFrame", function(){
			this.simulate();
		});
		return this;
	},
	simulate: function()
	{
		var oldpos = { x: this.x, y: this.y };
		switch ( this.direction )
        {
        	case Player.Direction.UP:
        		this.y -= 1;
        		break;
        	case Player.Direction.DOWN:
        		this.y += 1;
        		break;
        	case Player.Direction.LEFT:
        		this.x -= 1;
        		break;
        	case Player.Direction.RIGHT:
        		this.x += 1;
        		break;
        	case Player.Direction.NONE:
        		break;
        }
        //this.trigger('Moved', oldpos);
	},
	updateState: function(data)
	{
		this.x = data.x;
		this.y = data.y;
		this.moveSpeed = data.speed;
		this.direction = data.dir;
		this.trigger('ChangeDirection', data.dir);
	}
})


