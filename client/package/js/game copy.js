window.onload = function()
{
  Crafty.init( 1024, 600 );

  Sprites.create('tileset');
	
  Crafty.c( "Controls",
  {
    init: function()
    {
      this.requires( 'Multiway' );
    },
    controls: function( speed )
    {
      this.multiway( speed, { UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180 } );
      return this;
    }
  });

  //the loading screen that will display while our assets load
  Crafty.scene( "loading", function()
  {
    //load takes an array of assets and a callback when complete
    Crafty.load(["img/sprite.png", "img/background.png"], function()
    {
      // when everything is loaded, display main scene
      Crafty.scene( "title" );
    });

    Crafty.scene( "title", function()
    {
      Crafty.e( "2D, DOM, Image" )
            .attr( { x: 0, y: 0 } )
            .image( "img/background.png" );

      Crafty.e( "2D, DOM, Image, Mouse" )
            .attr( { x: 175, y: 200 } )
            .image( "img/start.png" )
            .bind( 'Click', function()
            {
              Crafty.scene( "game" );
            });
    });

    function generateWorld()
    {
      //loop through all tiles
      for (var i = 0; i < 25; i++) {
        for (var j = 0; j < 21; j++) {
          //place grass on all tiles
          var grassType = Crafty.math.randomInt(1, 4);
          Crafty.e("2D, DOM, grass" + grassType)
                .attr({ x: i * 16, y: j * 16, z: 1 });

          //create a fence of bushes
          if (i === 0 || i === 24 || j === 0 || j === 20)
          Crafty.e("2D, DOM, solid, bush" + Crafty.math.randomInt(1, 2))
                .attr({ x: i * 16, y: j * 16, z: 2 });

          //generate some nice flowers within the boundaries of the outer bushes
          if (i > 0 && i < 24 && j > 0 && j < 20
            && Crafty.math.randomInt(0, 50) > 30
            && !(i === 1 && j >= 16)
            && !(i === 23 && j <= 4))
          {
            var f = Crafty.e("2D, DOM, flower, solid, SpriteAnimation, explodable")
                          .attr({ x: i * 16, y: j * 16, z: 1000 })
                          .animate("wind", 0, 1, 3)
                          //.animate('wind', 80, -1)
                          .bind('explode', function ()
                          {
                            this.destroy();
                          });
          }

          //grid of bushes
          if ((i % 2 === 0) && (j % 2 === 0))
          {
            Crafty.e("2D, DOM, solid, bush1")
                  .attr({ x: i * 16, y: j * 16, z: 2000 });
          }
        }
      }
    }

    Crafty.scene("game", function()
    {
      generateWorld();

      var player = Crafty.e("2D, DOM, Controls, player")
                         .attr({ x: 50, y: 50, z: 5000 })
                         .controls(1);
    });
  });

  // display loading scene
  Crafty.scene( "loading" );
};
