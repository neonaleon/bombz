window.onload = function()
{
  Crafty.init(1024, 600);

  Sprites.create('tileset');

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

    Crafty.scene("game", function()
    {
      Map.generateWorld();

      Player.spawn(1);
      // Player.spawn(2);
      // Player.spawn(3);
      // Player.spawn(4);
    });
  });

  // display loading scene
  Crafty.scene( "loading" );
};
