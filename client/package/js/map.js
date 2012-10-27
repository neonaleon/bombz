var Map ={};

Map.generateWorld = function()
{
  var startI = (Map.XRes - (Map.WIDTH*Map.TILEWIDTH))/2;
  var startJ = (Map.YRes - (Map.HEIGHT*Map.TILEHEIGHT))/2;
  //loop through all tiles
  for (var i = 0; i < Map.WIDTH; i++) {
    for (var j = 0; j < Map.HEIGHT; j++) {
      Crafty.e("2D, DOM, floor")
            .attr({ x: startI+(i * Map.TILEWIDTH), y: startJ+(j * Map.TILEHEIGHT), z: 1 });

      //fence
      if (i === 0 || i === (Map.WIDTH-1) || j === 0 || j === (Map.HEIGHT-1)) {
      Crafty.e("2D, DOM, solid, tileI")
            .attr({ x: startI+(i * Map.TILEWIDTH), y: startJ+(j * Map.TILEHEIGHT), z: 5 });
      }

      //grid of bushes
      if ((i % 2 === 0) && (j % 2 === 0))
      {
        Crafty.e("2D, DOM, solid, tileD")
              .attr({ x: startI+(i * Map.TILEWIDTH), y: startJ+(j * Map.TILEHEIGHT), z: 4 });
      }
    }
  }
};

Map.setPlayerLoc = function (player, loc){
  
};

Map.addBomb = function(loc) {

};

Map.removeTile = function(loc) {

};

Map.addPowerup = function(powerup, loc) {
  //generate some random powerups within the boundaries
  // if (i > 0 && i < 39 && j > 0 && j < 23
  //   && Crafty.math.randomInt(0, 50) > 30
  //   && !(i === 1 && j >= 25)
  //   && !(i === 23 && j <= 4))
  // {
  //   var f = Crafty.e("2D, DOM, tileU, solid, SpriteAnimation, explodable")
  //                 .attr({ x: i * 25, y: j * 25, z: 1000 })
  //                 .animate("wind", 0, 1, 3)
  //                 //.animate('wind', 80, -1)
  //                 .bind('explode', function ()
  //                 {
  //                   this.destroy();
  //                 });
  // }
};

Map.startSuddenDeath = function () {

};

/*================
  Static Variables
  ================*/
Map.XRes = 1000;
Map.YRes = 600;
Map.WIDTH = 30; // 40*25 = 1000
Map.HEIGHT = 24; // 24*25 = 600
Map.TILEWIDTH = 25;
Map.TILEHEIGHT = 25;



/*1 floor
2 powerup
3 bomb
4 desTile
5 indesTile
6 player*/