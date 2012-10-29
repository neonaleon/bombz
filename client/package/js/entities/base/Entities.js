/*
 * Entities.js
 * @author: Leon Ho
 */

var Entities = {};

/*
 * Creates components for specified sprite_name
 * Returns a Dragon entity
 */
Entities.Dragon = function(sprite_name)
{
	var def = SpriteDefinitions[sprite_name];
	// create Sprite components from SpriteDefinitions given sprite_name
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	var dragon = Crafty.e(Properties.RENDERER + ", 2D, " + sprite_name)
					.setName(sprite_name);
					
	dragon.addComponent("SpriteAnimation, Collision")
				.animate("walk_up", def['anim_walk_up'])
				.animate("walk_right", def['anim_walk_right'])
				.animate("walk_down", def['anim_walk_down'])
				.animate("walk_left", def['anim_walk_left'])
				.bind("NewDirection", function (newdir) {
                    if (newdir.x < 0)
                        if (!this.isPlaying("walk_left")) this.stop().animate("walk_left", 15, -1);
                    if (newdir.x > 0)
                        if (!this.isPlaying("walk_right")) this.stop().animate("walk_right", 15, -1);   
                    if (newdir.y < 0)
                        if (!this.isPlaying("walk_up")) this.stop().animate("walk_up", 10, -1);
                    if (newdir.y > 0)
                        if (!this.isPlaying("walk_down")) this.stop().animate("walk_down", 10, -1);

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

Entities.Map = function(map_name)
{
	var map = Crafty.e("2D");
	
	var def = SpriteDefinitions[map_name];
	
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	return map;
};


