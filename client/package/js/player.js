var Player = {}

Crafty.c('Dwagon', {
        Dwagon: function() {
                //setup animations
                this.requires("SpriteAnimation, Collision")
                .bind("NewDirection",
                    function (direction) {
                        if (direction.x < 0) {
                            if (!this.isPlaying("walk_left"))
                                this.stop().animate("walk_left", 2,-1);
                        }
                        if (direction.x > 0) {
                            if (!this.isPlaying("walk_right"))
                                this.stop().animate("walk_right", 2,-1);
                        }
                        if (direction.y < 0) {
                            if (!this.isPlaying("walk_up"))
                                this.stop().animate("walk_up", 2,-1);
                        }
                        if (direction.y > 0) {
                            if (!this.isPlaying("walk_down"))
                                this.stop().animate("walk_down", 2,-1);
                        }
                        if(!direction.x && !direction.y) {
                            this.stop();
                        }
                })
                .bind('Moved', function(from) {
                    var hit = this.hit('solid');
                    if(hit){
                        this.attr({x: from.x, y:from.y});
                    }
                });
            return this;
        }
    });

Crafty.c("Controls", {
        init: function() {
            this.requires('Multiway');
        },
        Controls: function(speed) {
            this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
            return this;
        }
        
    });

Player.spawn = function(player) {
	var startI = (Map.XRes - (Map.WIDTH*Map.TILEWIDTH))/2;
	var startJ = (Map.YRes - (Map.HEIGHT*Map.TILEHEIGHT))/2;
	if (player == 1) {
		player1 = Crafty.e("2D, DOM, Controls, player1d1, Dwagon, SpriteAnimation")
                        .animate("walk_left", 7, 0, 9)
                        .animate("walk_right", 2, 0, 4)
                        .animate("walk_up", 0, 0, 1)
                        .animate("walk_down", 5, 0, 6)
                         .attr({ x: startI+Map.TILEWIDTH, y: startJ+Map.TILEHEIGHT, z: 6 })
                         .Controls(1)
                         .Dwagon();

    } else if (player == 2) {
    	startI = startI + (Map.WIDTH*Map.TILEWIDTH);
    	startJ = startJ + (Map.HEIGHT*Map.TILEHEIGHT);
		player2 = Crafty.e("2D, DOM, Controls, player2d1, Dwagon, SpriteAnimation")
                        .animate("walk_left", 7, 1, 9)
                        .animate("walk_right", 2, 1, 4)
                        .animate("walk_up", 0, 1, 1)
                        .animate("walk_down", 5, 1, 6)
                         .attr({ x: startI-2*Map.TILEWIDTH, y: startJ-2*Map.TILEHEIGHT, z: 7 })
                         .Controls(1)
                         .Dwagon();
    } else if (player == 3) {
    	startI = startI + (Map.WIDTH*Map.TILEWIDTH);
		player3 = Crafty.e("2D, DOM, Controls, player3d1, Dwagon, SpriteAnimation")
                        .animate("walk_left", 7, 2, 9)
                        .animate("walk_right", 2, 2, 4)
                        .animate("walk_up", 0, 2, 1)
                        .animate("walk_down", 5, 2, 6)
                         .attr({ x: startI-2*Map.TILEWIDTH, y: startJ+Map.TILEHEIGHT, z: 8 })
                         .Controls(1)
                         .Dwagon();
    } else if (player == 4) {
    	startJ = startJ + (Map.HEIGHT*Map.TILEHEIGHT);
		player4 = Crafty.e("2D, DOM, Controls, player4d1, Dwagon, SpriteAnimation")
                        .animate("walk_left", 7, 3, 9)
                        .animate("walk_right", 2, 3, 4)
                        .animate("walk_up", 0, 3, 1)
                        .animate("walk_down", 5, 3, 6)
                         .attr({ x: startI+Map.TILEWIDTH, y: startJ-2*Map.TILEHEIGHT, z: 9 })
                         .Controls(1)
                         .Dwagon();
    }
}

var player1 = {};
var player2 = {};
var player3 = {};
var player4 = {};