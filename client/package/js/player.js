var Player = {}

Player.spawn = function(player) {
	if (player == 1) {
		var startI = (Map.XRes - (Map.WIDTH*Map.TILEWIDTH))/2;
  		var startJ = (Map.YRes - (Map.HEIGHT*Map.TILEHEIGHT))/2;
		Crafty.e("2D, DOM, Controls, player1")
                         .attr({ x: startI+Map.TILEWIDTH, y: startJ+Map.TILEHEIGHT, z: 6 })
                         .controls(1);
    }
}

var player1 = {};
var player2 = {};
var player3 = {};
var player4 = {};