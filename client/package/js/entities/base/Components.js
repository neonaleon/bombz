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
		this.blastRadius = 2;
		this.moveSpeed = 3;
		this.eggLimit = 2;
		this.eggCount = 0;
		this.hasFireball = false;
		this.direction = undefined;

		this.lastUpdate = undefined;
		this.expectedPosition = undefined;
		
		this.bind('reset_stats', function(){
			this.moveSpeed = 4;
			this.eggLimit = 2;
			this.blastRadius = 2;
		})
		
		return this;
	},
	dragon: function(color){
		this.color = color;
		return this;
	},
	die: function(){
		// only send update if local dragon
		if (this.has('LocalPlayer')) {
			NetworkManager.SendMessage(MessageDefinitions.DEATH, { timestamp: WallClock.getTime() });
			aButton.addComponent('fireballButton_none')
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
				var dragons = fire.hit('Dragon');
				if (dragons)
				{
					for (var k = 0; k < dragons.length; k++)
						dragons[k].obj.trigger('burn'); 
				}
				var blocks = fire.hit('Burnable');
				if (blocks) { if (!blocks[0].obj.has('Dragon')) { blocks[0].obj.trigger('burn'); break; }}
				if (fire.hit('solid')) { fire.destroy(); break; }
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
		this.requires(Properties.RENDERER + ", 2D, fire, SpriteAnimation, Collision");
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
		this.owner = undefined;
		this.direction = { x: 0, y: 0 };
		return this;
	},
	fireball: function(owner, pos, dir){
		this.owner = owner;
		this.origin("center");
		switch ( dir )
        {
        	case Player.Direction.UP:
        		this.direction.y = -1;
        		this.rotation = 90;
        		break;
        	case Player.Direction.DOWN:
        		this.direction.y = 1;
        		this.rotation = -90;
        		break;
        	case Player.Direction.LEFT:
        		this.direction.x = -1;
        		break;
        	case Player.Direction.RIGHT:
        		this.direction.x = 1;
        		this.flip();
        		break;
        }
        this.x = pos.x + this.direction.x * Map.MAP_TILEWIDTH;
        this.y = pos.y + this.direction.y * Map.MAP_TILEHEIGHT;
        
        this.animate('fireball', 10, -1);
        
		this.bind("EnterFrame", function()
		{
			var hitDragon = this.hit('Dragon');
			if (hitDragon)
			{
				for (var i = 0; i < hitDragon.length; i++)
				{
					if (hitDragon[i].obj != this.owner && !hitDragon[i].obj.has('DodgeballPlayer'))
					{
						hitDragon[i].obj.trigger('burn');
						this.destroy();
					}
				}
			}
			if (this.hit('Egg'))
			{
				this.hit('Egg')[0].obj.trigger('burn');
				this.destroy();
			}
			if (this.hit('extents')) this.destroy();
			this.x += this.direction.x * EntityDefinitions.FIREBALL_MOVE_SPEED;
			this.y += this.direction.y * EntityDefinitions.FIREBALL_MOVE_SPEED;
		});
		return this;
	},
});

Crafty.c('Killable', {
	init: function() {
		this.bind('killed', function(data){
			this.addComponent('Death');
			this.trigger('death', data);
			this.removeComponent('Killable');
		});
		return this;
	},
});

Crafty.c('Death', {
	init: function() {
		this.trigger('reset_stats');
		Crafty.audio.play(AudioDefinitions.DEATH);
		
		this.wings = undefined;
		this.cloud = undefined;
		this.deathAnimStep = 2; // 2 step death animation (fade out, fade in)
		this.step2props = 2; // 2 properties being interpolated at each step
		this.step1props = 2;
		this.deathPos = undefined; // deathPos not yet received from server
		this.num_anim_frames = 50;
		
		this.addComponent('DodgeballPlayer');
		
		if (this.has('LocalPlayer')) 
		{
			this.unbind('KeyDown_A');
			this.flushUpdates();
			this.disableControl();
		}
		
		this.wings = Entities.Wings().attr({ x: this.x, y: this.y }).tween({ alpha: 0 }, 50);
		this.attach(this.wings);
		
		this.requires('Tween');
		this.tween({ y: this.y - 50, alpha: 0 }, 50); // fade out
		
		// set player to face down, and stop animating
		this.trigger("ChangeDirection", Player.Direction.DOWN);
		this.trigger("ChangeDirection", Player.Direction.NONE); 
		
		this.bind('TweenEnd', function(prop)
		{
			if (this.deathAnimStep == 2)
			{
				if (prop == 'y' || prop == 'alpha') this.step2props -= 1;
				if (this.step2props == 0) this.deathAnimStep -= 1;
				// first animation step ends, check if death position received from server
				if (this.step2props == 0 && this.deathPos !== undefined)
				{
					this.x = this.deathPos.x;
					this.y = this.deathPos.y - 50;
					this.wings.tween({ alpha: 1 }, this.num_anim_frames)
					this.tween({ y: this.deathPos.y, alpha: 1 }, this.num_anim_frames); // fade back in
				}
			}
			else if (this.deathAnimStep == 1)
			{
				
				if (prop == 'y' || prop == 'alpha') this.step1props -= 1;
				if (this.step1props == 0) this.deathAnimStep -= 1;
			}
			
			if (this.deathAnimStep == 0) // second animation step ends, player has tweened to death position
			{	
				// snap to clear floating point inaccuracies due to tween interpolation
				this.x = this.deathPos.x;
				this.y = this.deathPos.y;

				console.log(this.wings);
				this.wings.destroy();
				this.wings = undefined;
				
				this.cloud = Entities.Cloud().attr({ x: this.deathPos.x, y: this.deathPos.y }); // make cloud at deathPos
				this.attach(this.cloud);
				
				if (this.has('LocalPlayer'))
				{
					this.flushUpdates();
					this.enableControl();
					this.bind('KeyDown_A', this.spitFireball); // change ability
				}
				this.removeComponent('Death', false);
			}
		})
		
		this.bind('death', function(data)
		{
			// death position received from server
			this.deathPos = Map.getDeathLocation(data);
			
			this.num_anim_frames = Math.max(this.num_anim_frames - Math.floor((WallClock.getTime() - data.timestamp) / 20));
			
			// force animation when the death message is received
			if (this.deathAnimStep == 1) 
			{
				this.x = this.deathPos.x;
				this.y = this.deathPos.y - 50;
				this.wings.tween({ alpha: 1 }, this.num_anim_frames)
				this.tween({ y: this.deathPos.y, alpha: 1 }, this.num_anim_frames); // fade back in
			} 
		});
		
		return this;
	},
})

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

Crafty.c('DodgeballPlayer', {
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
				if (dragon.has('Death')) return; // if dragon dead can ignore

				Crafty.audio.play(AudioDefinitions.POWERUP);
				
				// send message to inform on collection
				var data = {};

				if ( this.type !== EntityDefinitions.POWERUP_FIREBALL )
					data = Map.pixelToTile( { x: this.x, y: this.y } );
				else
					data = Map.fireballPixelToTile( { x: this.x, y: this.y } );

				data.timestamp = WallClock.getTime();

				// only send update if local dragon
				if (dragon.has('LocalPlayer'))
					NetworkManager.SendMessage(MessageDefinitions.POWERUP, data);
				
				this.destroy();
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
			//this.canKick = true;
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
			this.moveSpeed = Math.min(this.moveSpeed + 1, EntityDefinitions.MOVESPEED_CAP);
			this.unbind("applyPowerup");
			this.removeComponent(EntityDefinitions.POWERUP_SPEED + "_powerup", false);
		});
		return this;
	},
});

/*
 * @comp blast
 */
Crafty.c(EntityDefinitions.POWERUP_BLAST + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){ 
			this.blastRadius = Math.min(this.blastRadius + 1, EntityDefinitions.BLAST_CAP);
			this.unbind("applyPowerup");
			this.removeComponent(EntityDefinitions.POWERUP_BLAST + "_powerup", false); 
		});
		return this;
	},
});

/*
 * @comp egg_limit
 */
Crafty.c(EntityDefinitions.POWERUP_EGGLIMIT + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){ 
			this.eggLimit = Math.min(this.eggLimit + 1, EntityDefinitions.EGG_CAP);
			this.unbind("applyPowerup");
			this.removeComponent(EntityDefinitions.POWERUP_EGGLIMIT + "_powerup", false); 
		});
		return this;
	},
});

Crafty.c(EntityDefinitions.POWERUP_FIREBALL + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){ 
			this.hasFireball = true;
			if (this.has('LocalPlayer'))
				aButton.addComponent('fireballButton');
			this.unbind("applyPowerup");
			this.removeComponent(EntityDefinitions.POWERUP_FIREBALL + "_powerup", false); 
		});
		return this;
	}
})

/*=======================
 * Network related components
 ========================*/
Crafty.c("LocalPlayer", {
	init: function(){
		this.updateTypeMove = 'move';
		this.updateTypeDirection = 'direction';
		this.updateTypeEgg = 'egg';
		this.updateTypeFireball = 'fireball';
		this.updateQueue = [];
		this.flush = false;
		// the local player can be controlled
		this.requires("Controllable");
		
		this.bind('EnterFrame', this.processUpdates);
		
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

			// don't store direction if it is none, so we have the latest direction player is facing
			if ( direction !== Player.Direction.NONE )
            	this.direction = direction;
            
            var data = { timestamp: WallClock.getTime(), x: this.x, y: this.y, dir: direction };
           	this.doLocalUpdate(this.updateTypeDirection, data);
		});
		
		// perform collision detection when the entity is being moved
		this.bind('Moved', function(oldpos)
		{
			var data = {};
			data.dragon = this;
			data.dx = this.x - oldpos.x;
			data.dy = this.y - oldpos.y;
			this.doLocalUpdate(this.updateTypeMove, data);
			this.x = oldpos.x;
			this.y = oldpos.y;
		});
		
		this.bind('KeyDown', function(keyEvent){
			if (keyEvent.key == Crafty.keys['A'])
				this.trigger('KeyDown_A');
		});
		
		this.bind('KeyDown_A', this.layEgg);
		
		return this;
	},
	
	layEgg: function(){
		if (!this.onEgg && this.eggCount < this.eggLimit)
		{
			this.eggCount += 1;
			
			var data = Map.pixelToTile({x: this.x, y: this.y});
			data.timestamp = WallClock.getTime();
			data.dragon = this;
			data.fusetime = EntityDefinitions.LOCAL_FUSETIME;
			this.doLocalUpdate(this.updateTypeEgg, data);
		};
	},
	
	spitFireball: function(){
		if (this.hasFireball)
		{
			this.hasFireball = false;
			
			var data = Map.pixelToTile({x: this.x, y: this.y});
			data.dragon = this;
			data.direction = this.direction;
			data.timestamp = WallClock.getTime();
			
			this.doLocalUpdate(this.updateTypeFireball, data);
		}	
	},
	
	doLocalUpdate: function(updateType, data){
		switch(updateType){
			case this.updateTypeMove:
				this.delayLocalUpdate(updateType, data);
				break;
			case this.updateTypeDirection:
				// send when change direction
				NetworkManager.SendMessage(MessageDefinitions.MOVE, data);
				this.delayLocalUpdate(updateType, data);
				break;
			case this.updateTypeEgg:
				NetworkManager.SendMessage(MessageDefinitions.BOMB, { x: data.x, y: data.y, timestamp: data.timestamp });
				this.delayLocalUpdate(updateType, data)
				break;
			case this.updateTypeFireball:
				NetworkManager.SendMessage(MessageDefinitions.FIREBALL, { x: data.x, y: data.y, direction: this.direction, timestamp: data.timestamp });
				this.delayLocalUpdate(updateType, data);
				break;
		}
	},
	
	delayLocalUpdate: function(updateType, data){
		data.updateType = updateType;
		data.timeCalled = (new Date()).getTime();
		this.updateQueue.push(data);
	},
	
	processUpdates: function()
	{
		if (this.flush) 
		{
			this.flush = false;
			this.updateQueue.splice(0, this.updateQueue.length);
			return;
		}
		var processedCount = 0;
		for (var i = 0; i < this.updateQueue.length; i++)
		{
			var data = this.updateQueue[i];
			if ((new Date()).getTime() > data.timeCalled + NetworkManager.localLag)
			{
				switch(data.updateType)
				{
					case this.updateTypeMove:
						this.processMove(data);
						break;
					case this.updateTypeDirection:
						this.processDirection(data);
						break;
					case this.updateTypeEgg:
						this.processEgg(data);
						break;
					case this.updateTypeFireball:
						this.processFireball(data);
						break;
				}
				processedCount += 1;
			}
			else
				break;
		}
		this.updateQueue.splice(0, processedCount);
	},
		
	flushUpdates: function()
	{
		// reset all input keys
		if (Crafty.keydown[Crafty.keys['A']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['A'] });
		if (Crafty.keydown[Crafty.keys['RIGHT_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['RIGHT_ARROW'] });
		if (Crafty.keydown[Crafty.keys['LEFT_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['LEFT_ARROW'] });
		if (Crafty.keydown[Crafty.keys['UP_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['UP_ARROW'] });
		if (Crafty.keydown[Crafty.keys['DOWN_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['DOWN_ARROW'] });
		
		this.flush = true;
	},
	
	processMove: function(data)
	{
		var dragon = data.dragon;
		dragon.x += data.dx * dragon.moveSpeed;
		dragon.y += data.dy * dragon.moveSpeed;
		if (dragon.onEgg && dragon.hit('Egg').length == 1)
    	{
    		if (dragon.hit('solid'))
        		dragon.attr(Map.tileToPixel(Map.pixelToTile({x: dragon.x, y:dragon.y}))); // snap to grid
    	}
    	else 
    	{
    		if (dragon.hit('solid') || dragon.hit('Egg'))
        	{
        		//TODO: KICK
        		//var egg = dragon.hit('Egg');
        		// egg.trigger('kick');
        		//if (egg && this.has(EntityDefinitions.POWERUP_KICK + "_powerup"))
        		//	egg[0].obj.trigger('kicked', {x: this.x - oldpos.x, y: this.y - oldpos.y});
        		//this.x = oldpos.x;
        		//this.y = oldpos.y;
        		dragon.attr(Map.tileToPixel(Map.pixelToTile({x: dragon.x, y:dragon.y})));
        	}
    	}
	},
	
	processDirection: function(data)
	{
		this.trigger('ChangeDirection', data.dir);
	},
	
	processEgg: function(data)
	{
		var dragon = data.dragon;
		Map.spawnEggOnTile(dragon, data, data.fusetime);
	},

	processFireball: function(data)
	{
		var pos = Map.tileToPixel(data);
		Entities.Fireball().fireball(data.dragon, pos, data.direction);
	},
});

Crafty.c("NetworkedPlayer", {
	init: function(){
		this.bind("network_update", function(data){
			this.updateState(data);
		});
		this.bind("EnterFrame", function(){
			this.simulate();
		});
		
		// perform collision detection when the entity is being moved
		this.bind('Moved', function(oldpos)
		{
			this.x = oldpos.x + (this.x - oldpos.x) * this.moveSpeed;
			this.y = oldpos.y + (this.y - oldpos.y) * this.moveSpeed;
			
			if (this.onEgg && this.hit('Egg').length == 1)
        	{
        		if (this.hit('solid'))
        		{
        			this.attr(Map.tileToPixel(Map.pixelToTile({x: this.x, y: this.y}))); // snap to grid
        		}
        	}
        	else 
        	{
        		if (this.hit('solid') || this.hit('Egg'))
        		{
        			this.attr(Map.tileToPixel(Map.pixelToTile({x: this.x, y: this.y})));
        		}
            		
        	}
		});	
		return this;
	},
	simulate: function()
	{
		//WallClock.sync();
		//console.log(WallClock.delay);
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
        this.trigger('Moved', oldpos);
	},
	updateState: function(data)
	{
		this.moveSpeed = data.speed;
		this.direction = data.dir;
		switch ( this.direction )
        {
        	case Player.Direction.UP:
        		this.y -= 1 * this.moveSpeed;
        		break;
        	case Player.Direction.DOWN:
        		this.y += 1 * this.moveSpeed;
        		break;
        	case Player.Direction.LEFT:
        		this.x -= 1 * this.moveSpeed;
        		break;
        	case Player.Direction.RIGHT:
        		this.x += 1 * this.moveSpeed;
        		break;
        	case Player.Direction.NONE:
        		break;
        }
		if (data.dir != 4)
		{
			this.x = data.x;
			this.y = data.y;
			this.simulate();
			var simFrames = Math.floor((WallClock.getTime() - data.timestamp) / 20);
			for (var i = 0; i < simFrames; i++)
				this.simulate();
		}
		this.trigger('ChangeDirection', data.dir);
	}
})


