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
		this.moveSpeed = 5;
		this.eggLimit = 2;
		this.eggCount = 0;
		this.hasFireball = false;
		this.direction = undefined;

		this.lastUpdate = undefined;
		this.expectedPosition = undefined;
		
		return this;
	},
	dragon: function(color){
		this.color = color;
		return this;
	},
	die: function(){
		this.addComponent('Death');
		// only send update if local dragon
		if (this.has('LocalPlayer')) 
			NetworkManager.SendMessage(MessageDefinitions.DEATH, { timestamp: WallClock.getTime() });
	},

	layEgg: function(){
		if (!this.onEgg && this.eggCount < this.eggLimit)
		{
			Crafty.audio.play(AudioDefinitions.EGG);
			this.eggCount += 1;
			var data = Map.pixelToTile({x: this.x, y: this.y});
			data.timestamp = WallClock.getTime();
			NetworkManager.SendMessage(MessageDefinitions.BOMB, data);
			this.timeout(function (){ Map.spawnEggOnTile(this, data, EntityDefinitions.LOCAL_FUSETIME); }, NetworkManager.localLag);
		};
	},
	spitFireball:function(){
		console.log("SPIT FIRE!");
		if (this.hasFireball)
		{
			Crafty.audio.play(AudioDefinitions.FIREBALL);
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
		// this.bind('Moved', function(oldpos)
		// {
		// 	this.x = oldpos.x + (this.x - oldpos.x) * EntityDefinitions.EGG_MOVE_SPEED;
		// 	this.y = oldpos.y + (this.y - oldpos.y) * EntityDefinitions.EGG_MOVE_SPEED;

		// 	if (this.hit('solid') || this.hit('Egg'))
  //       	{
  //       		this.attr(Map.tileToPixel(Map.pixelToTile({x: this.x, y:this.y}))); // snap to grid
  //       	}
  //       });
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

Crafty.c('Killable', {
	init: function() {
		this.bind('killed', function(tile){
			this.trigger('death', tile);
			this.removeComponent('Killable');
		});
		return this;
	},
});

Crafty.c('Death', {
	init: function() {
		Crafty.audio.play(AudioDefinitions.DEATH);
		this.deathAnimStep = 2; // 2 step death animation
		this.deathPos = undefined; // deathPos not yet received from server
		// add burnt dragon sprite
		//var def = SpriteDefinitions[SpriteDefinitions.BURNT];
		//Crafty.sprite(def['tile'], def['file'], def['elements']);
		//this.addComponent(SpriteDefinitions.BURNT + 'dragon');
		
		this.requires('Tween');
		this.alpha = 0.75; // ghost mode
		this.tween({ y: this.y - 30 }, 30);
		
		if (this.has('LocalPlayer')) 
		{
			this.unbind('KeyDown_A');
			this.flushUpdates();
			this.disableControl();
		}
		//this.trigger("ChangeDirection", Player.Direction.DOWN);
		
		this.bind('TweenEnd', function(something)
		{
			this.deathAnimStep -= 1;
			if (this.deathAnimStep == 1)
			{
				// first animation step ends, check if death position received from server
				if (this.deathPos !== undefined) this.tween(this.deathPos, 300);
			}
			else if (this.deathAnimStep == 0) // second animation step ends, player has tweened to death position
			{
				this.alpha = 1; // undo ghost mode
				
				var cloud = Entities.Cloud().attr({ x: this.x, y: this.y });
				this.attach(cloud);
				
				// snap to clear floating point inaccuracies due to tween interpolation
				this.x = this.deathPos.x;
				this.y = this.deathPos.y;
				
				//this.removeComponent('4dragon');  clear the burn
				
				if (this.has('LocalPlayer'))
				{
					this.enableControl();
					this.flushUpdates();
					this.bind('KeyDown_A', this.spitFireball); // change ability
				}
			}
		})
		
		this.bind('death', function(tile)
		{
			// death position received from server
			this.deathPos = Map.getDeathLocation(tile);
			// see if first animation step is complete, otherwise when it is complete, it will tween
			// this is for the case where the msg comes in a lot later than the time for the death animation which is ~500ms
			if (this.deathAnimStep == 1) this.tween(this.deathPos, 300);
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
				Crafty.audio.play(AudioDefinitions.POWERUP);
				var dragon = hitDragon[0].obj;
				// effects don't apply until message returns
				//dragon.addComponent(this.type + "_powerup");
				//dragon.trigger('applyPowerup');

				// send message to inform on collection
				var data = Map.pixelToTile( { x: this.x, y: this.y } );
				data.timestamp = WallClock.getTime();

				// only send update if local dragon
				if (dragon.has('LocalPlayer'))
					NetworkManager.SendMessage(MessageDefinitions.POWERUP, data);
				
				// taken by a live player
				if (!dragon.has('Death'))
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
		this.bind("applyPowerup", function(){ 
			this.blastRadius = Math.min(this.blastRadius + 1, EntityDefinitions.BLAST_CAP);
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
		this.bind("applyPowerup", function(){ 
			this.eggLimit = Math.min(this.eggLimit + 1, EntityDefinitions.EGG_CAP);
			this.removeComponent(EntityDefinitions.POWERUP_EGGLIMIT + "_powerup"); 
		});
		return this;
	},
});

Crafty.c(EntityDefinitions.POWERUP_FIREBALL + "_powerup", {
	init: function(){
		this.bind("applyPowerup", function(){ 
			this.hasFireball = true;
			this.removeComponent(EntityDefinitions.POWERUP_FIREBALL + "_powerup"); 
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
		console.log("SPIT FIRE!");
		if (this.hasFireball)
		{
			/*
			var pos = Map.tileToPixel(Map.pixelToTile({x: this.x, y: this.y}));
			pos.x += this.direction.x;
			pos.y += this.direction.y;
			Entities.Fireball().fireball(this.direction)
								.attr(pos);
			*/
			this.hasFireball = false;
			
			var data = Map.pixelToTile({x: this.x, y: this.y});
			data.direction = this.direction;
			data.timestamp = WallClock.getTime();
			//NetworkManager.SendMessage(MessageDefinitions.FIREBALL, data);
		}	
	},
	
	doLocalUpdate: function(updateType, data){
		switch(updateType){
			case this.updateTypeMove:
				//console.log(data)
				this.delayLocalUpdate(updateType, data);
				break;
			case this.updateTypeDirection:
				NetworkManager.SendMessage(MessageDefinitions.MOVE, data);
				this.delayLocalUpdate(updateType, data);
				break;
			case this.updateTypeEgg:
				NetworkManager.SendMessage(MessageDefinitions.BOMB, { x: data.x, y: data.y, timestamp: data.timestamp });
				this.delayLocalUpdate(updateType, data)
				break;
			case this.updateTypeFireball:
				NetworkManager.SendMessage(MessageDefinitions.FIREBALL, data);
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
		console.log("FLUSH");
		// reset all input keys
		if (Crafty.keydown[Crafty.keys['A']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['A'] });
		if (Crafty.keydown[Crafty.keys['RIGHT_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['RIGHT_ARROW'] });
		if (Crafty.keydown[Crafty.keys['LEFT_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['LEFT_ARROW'] });
		if (Crafty.keydown[Crafty.keys['UP_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['UP_ARROW'] });
		if (Crafty.keydown[Crafty.keys['DOWN_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['DOWN_ARROW'] });
		
		this.updateQueue.splice(0, this.updateQueue.length);
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
        		var egg = dragon.hit('Egg');
        		//TODO: KICK
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
		console.log("fireball not yet implementatatede");
	},
});

Crafty.c("NetworkedPlayer", {
	init: function(){
		this.bind("network_update", function(data){
			console.log("network update", data);
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
        this.trigger('Moved', oldpos);
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


