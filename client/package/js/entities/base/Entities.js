/*
 * Entities.js
 * @author: Leon Ho
 */

var Entities = {};

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

/*
 * @entity Dragon
 */
Entities.Dragon = function(color)
{
	// load all sprites related to this colored dragon (includes animation cycles, egg, fireball)
	var def = SpriteDefinitions[color];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	// create dragon entity
	var dragon = Crafty.e(Properties.RENDERER + ", 2D, Dragon, " + color + 'dragon')
						.setName(color + 'dragon')
						.dragon(color);

	// add animation and collision detection
	dragon.addComponent("SpriteAnimation, Collision")
				.animate("walk_up", def['anim_walk_up'])
				.animate("walk_right", def['anim_walk_right'])
				.animate("walk_down", def['anim_walk_down'])
				.animate("walk_left", def['anim_walk_left'])
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
                })
                .bind('Moved', function(oldpos) {
                    var hit = this.hit('solid');
                    if(hit){
                        this.attr({x: oldpos.x, y:oldpos.y});
                    }
                });

	return dragon;
};

/*
 * @entity Egg
 */
Entities.Egg = function(color)
{
	var egg = Crafty.e(Properties.RENDERER + ", 2D, Egg, " + color + 'egg')
						.setName(color + 'egg');
	
	// testing only
	egg.timeout(function(){ egg.trigger('explode'); console.log("BOOM"); }, 1000);
	
	return egg;
};

/*
 * @entity Powerup
 */
Entities.Powerup = function(type)
{
	var powerup = undefined;
	console.log("entity powerup not yet implemented");
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
