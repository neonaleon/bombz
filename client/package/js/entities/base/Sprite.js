/*
 * Sprite.js
 * @author: Leon Ho
 */

var Sprite = {};

/*
 * Creates components for specified sprite_name
 * Returns a Dragon entity
 */
Sprite.Dragon = function(sprite_name)
{
	var def = SpriteDefinitions[sprite_name];
	
	// create Sprite components from SpriteDefinitions given sprite_name
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	return Crafty.e(Properties.RENDERER + ", 2D, SpriteAnimation, Collision, defaultSprite")
					.animate("walk_up", 0, def['animRow'], 1)
					.animate("walk_right", 2, def['animRow'], 4)
					.animate("walk_down", 5, def['animRow'], 6)
					.animate("walk_left", 7, def['animRow'], 9)
					.bind("NewDirection", function (direction) {
                        if (direction.x < 0)
                            if (!this.isPlaying("walk_left")) this.stop().animate("walk_left", 2,-1);
                        else
                            if (!this.isPlaying("walk_right")) this.stop().animate("walk_right", 2,-1);
                                
                        if (direction.y < 0)
                            if (!this.isPlaying("walk_up")) this.stop().animate("walk_up", 2,-1);
                        else
                            if (!this.isPlaying("walk_down")) this.stop().animate("walk_down", 2,-1);

                        if(!direction.x && !direction.y) this.stop();
	                })
	                .bind('Moved', function(collider) {
	                    var hit = this.hit('solid');
	                    if(hit){
	                        this.attr({x: collider.x, y:collider.y});
	                    }
	                });
};

Sprite.Map = function(map_name)
{
	var map = Crafty.e("2D");
	
	var def = SpriteDefinitions[map_name];
	
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	
	return map;
};


