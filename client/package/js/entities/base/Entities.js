/*
 * Entities.js
 * @author: Leon Ho
 */

var Entities = {
	// powerup constants (follows SpriteDefinitions)
	POWERUP_KICK: 'kick',
	POWERUP_SPEED: 'speed',
	POWERUP_BLAST: 'blast',
	POWERUP_EGGLIMIT: 'egg_limit',
	
	EGG_MOVE_SPEED: 5,
};

/*
 * @entity Map
 */
Entities.Map = function(map_name)
{
	var map = Crafty.e("2D");
	
	var def = SpriteDefinitions[map_name];
	
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	return map;
};

Entities.DestructibleBlock = function()
{
	return Crafty.e("2D, DOM, Destructible, Burnable, solid, tileD")
					.bind('burn', function(){ this.destroy(); });
};

Entities.SolidBlock = function()
{
	return Crafty.e("2D, DOM, solid, tileI");
};

Entities.FloorTile = function()
{
	return Crafty.e("2D, DOM, floor");
};

/*
 * @entity Dragon
 * 
 */
Entities.Dragon = function(color)
{
	// load all sprites related to this colored dragon (includes animation cycles, egg, fireball)
	var def = SpriteDefinitions[color];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	// create dragon entity
	var dragon = Crafty.e(Properties.RENDERER + ", 2D, Burnable, Dragon, " + color + 'dragon')
						.setName(color + 'dragon')
						.bind('burn', function(){ dragon.loseHealth(); })
						.dragon(color);

	// add animation and collision logic
	dragon.addComponent("SpriteAnimation, Collision, WiredHitBox")
				.collision([10, 10], [30, 10], [30, 30], [10, 30]) // smaller hit box based on 40x40 sprites
				.animate("walk_up", def['anim_walk_up'])
				.animate("walk_right", def['anim_walk_right'])
				.animate("walk_down", def['anim_walk_down'])
				.animate("walk_left", def['anim_walk_left'])/*
				.bind("NewDirection", function (newdir) {
                    if (newdir.x < 0)
                        if (!this.isPlaying("walk_left")) this.stop().animate("walk_left", 6, -1);
                    if (newdir.x > 0)
                        if (!this.isPlaying("walk_right")) this.stop().animate("walk_right", 6, -1);   
                    if (newdir.y < 0)
                        if (!this.isPlaying("walk_up")) this.stop().animate("walk_up", 4, -1);
                    if (newdir.y > 0)
                        if (!this.isPlaying("walk_down")) this.stop().animate("walk_down", 4, -1);

                    if(!newdir.x && !newdir.y) this.stop();
                })*/
				.bind("ChangeDirection", function (direction) {
                    
                    switch ( direction )
                    {
                    	case Player.Direction.UP:
                    		if (!this.isPlaying("walk_up")) this.stop().animate("walk_up", 4, -1);
                    		break;
                    	case Player.Direction.DOWN:
                    		if (!this.isPlaying("walk_down")) this.stop().animate("walk_down", 4, -1);
                    		break;
                    	case Player.Direction.LEFT:
                    		if (!this.isPlaying("walk_left")) this.stop().animate("walk_left", 6, -1);
                    		break;
                    	case Player.Direction.RIGHT:
                    		if (!this.isPlaying("walk_right")) this.stop().animate("walk_right", 6, -1);
                    		break;
                    	case Player.Direction.NONE:
                    		this.stop();
                    		break;
                    }
                })
                .onHit('Egg', function(){ this.onEgg = true; }, function(){ this.onEgg = false; })
                .bind('Moved', function(oldpos) {
                	if (this.onEgg && this.hit('Egg').length == 1)
                	{
                		if (this.hit('solid'))
	                	{
	                		this.x = oldpos.x;
	                		this.y = oldpos.y;
	                	}
                	}
                	else 
                	{
                		if (this.hit('solid') || this.hit('Egg'))
	                	{
	                		var egg = this.hit('Egg');
	                		if (egg && this.has) egg[0].obj.trigger('kicked', {x: this.x - oldpos.x, y: this.y - oldpos.y});
	                		this.x = oldpos.x;
	                		this.y = oldpos.y;
	                	}
                	}
                });

	return dragon;
};

/*
 * @entity Egg
 */
Entities.Egg = function(dragon)
{
	var egg = Crafty.e(Properties.RENDERER + ", 2D, Burnable, Kickable, Egg," + dragon.color + 'egg')
						.setName(color + 'egg')
						.bind('burn', function(){ this.trigger('explode'); })
						.egg(3, 1500);
	egg.addComponent("Collision, WiredHitBox");
	egg.owner = dragon;
	return egg;
};

/*
 * @entity Powerup
 */
Entities.Powerup = function(type)
{
	var def = SpriteDefinitions['powerup'];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	var powerup = Crafty.e(Properties.RENDERER + ", 2D, Powerup, " + type)
							.powerup(type);
	return powerup;
}

/*
 * @entity Fireball
 */
Entities.Fireball = function()
{
	var fireball = undefined;
	console.log("entity fireball not yet implemented");
	return fireball;
}
