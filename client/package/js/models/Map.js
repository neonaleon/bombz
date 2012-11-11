//// IMPORTS
var Powerup = require( './Powerup' );

function Map( width, height, grid_width, grid_height, tiles )
{
//// PRIVATE VARIABLES
  this._tiles = tiles;                // Map.Tile[] - array of tiles
  this._width = width;                // int - number of grids horizontally
  this._height = height;              // int - number of grids vertically
  this._grid_width = grid_width;      // int - size of grids horizontally
  this._grid_height = grid_height;    // int - size of grids vertically

  this._cells = [];                   // 
  this._bombs = [];                   // Bomb[] - list of bombs currently on map
  this._powerups =                    // Powerup[] - list of powerups currently on map
  [
    Powerup.BUFF_SPEED, Powerup.BUFF_SPEED, 
    Powerup.BUFF_RANGE, Powerup.BUFF_RANGE,
    Powerup.BUFF_CAPACITY, Powerup.BUFF_CAPACITY,
    Powerup.ABILITY_KICKBOMB, Powerup.ABILITY_KICKBOMB
  ];

//// CONSTRAINTS
  if ( ( width * height ) != tiles.length )
  {
    console.log( 'Invalid map parameters - number of tiles do not match width and height of map.' );
  }
}


//// CONSTANTS
Map.WIDTH = 760;
Map.HEIGHT = 600;

Map.Tile =
{
  EMPTY: 0,
  DESTRUCTIBLE: 1,
  INDESTRUCTIBLE: 2,
};


//// PUBLIC FUNCTIONS
// converts pixel co-ordinate to grid co-ordinate
Map.prototype.ConvertPointToGrid = function( x, y )
{
  return {
    x: parseInt( x / this._grid_width ),
    y: parseInt( y / this._grid_height ),
  };
}

Map.prototype.GetTile = function( x, y )
{
  return this._tiles[ ( this._width * y ) + x ];
}

Map.prototype.SetTile = function( x, y, type )
{
  this._tiles[ ( this._width * y ) + x ] = type;
}

// add a bomb to the map
Map.prototype.AddBomb = function( bomb )
{
  var tile = GetTile( bomb.GetX(), bomb.GetY() );

}

// removes a bomb from the map
Map.prototype.RemoveBomb = function( bomb )
{
  
}

// add a powerup to the map if it is a valid grid for a bomb
Map.prototype.AddPowerup = function( powerup )
{
  var tile = GetTile( powerup.GetX(), powerup.GetY() );
}

// removes a powerup from the map if it is a valid grid for a bomb
Map.prototype.RemovePowerup = function( powerup )
{
  
}

// update map according to a bomb explosion if it is a valid grid for a powerup
Map.prototype.BombExplode = function( bomb )
{
  var bomb_owner = bomb.GetOwner();

  // directions left, up, right, down
  var directions = [{ x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }];

  var affected = [];

  // need to deal with bomb box?



  // for each direction, expand outwards and evaluate
  for ( var index in directions )
  {
    var x = bomb.GetX();
    var y = bomb.GetY();
    var direction = directions[ index ];

    for ( var range = 1; range <= bomb.GetRange(); range++ )
    {
      x += direction.x;
      y += direction.y;
      var tile = GetTile( x, y );

      if ( tile == Map.Tile.EMPTY )
      {

      }
      else if ( tile == Map.Tile.DESTRUCTIBLE )
      {
        
      }
      else if ( tile == Map.Tile.INDESTRUCTIBLE )
      {
        // stop exploding in this direction
        break;
      }
      else
      {

      }
    }
  }

  return affected;
}


Map.prototype.Generate = function()
{ 
  // Map._spawnPositions = Map.SPAWN_POSITIONS.slice();
  // Map._powerups = Map.POWERUPS.slice();
  
  this._tiles = [];
  
  for ( var y = 0; y < this._height; y++ )
  {
    for ( var x = 0; x < this._width; x++ )
    {
      // outermost border for dodge ballers
      if ( x % ( this._width - 1 ) === 0 || y % ( this._height - 1 ) === 0 )
      {
        this._tiles.push( Map.Tile.EMPTY );
      }
      // surrounding wall to separate dodge ballers
      else if ( x === 1 || x === ( this._width - 2 ) || y === 1 || y === ( this._height - 2 ) )
      {
        this._tiles.push( Map.Tile.INDESTRUCTIBLE );
      }
      // indestructible blocks in every other tile
      else if ( ( x % 2 !== 0 ) && ( y % 2 !== 0 ) )
      {
        this._tiles.push( Map.Tile.INDESTRUCTIBLE );
      }
      // everything else is floor with chance of spawning destructable tile
      else
      {
        this._tiles.push( ( Math.random() < 0.9 ) ? Map.Tile.DESTRUCTIBLE : Map.Tile.EMPTY );
      }
    }
  }
  /*
  var powerup_positions = [];
  // spawn powerups
  while (Map._powerups.length > 0)
  {
    console.log(Map._powerups.length);
    var powerup_type = Map._powerups.splice(0, 1)[0];
    console.log(powerup_type)
    
    do 
    {
      // roll unique position
      var pos = Crafty.math.randomInt(0, 116);
      var x = pos % 13 + 1;
      var y = parseInt(pos / 13) + 1;
      
    } while (powerup_positions.indexOf(pos) > 0 || ((x % 2 !== 0) && (y % 2 !== 0)))
    
    Map.spawnPowerup(powerup_type, x, y);
  }
  */
};

// representation
// used when map is just generated at start of game
// non-visible power ups (within blocks) are not included here otherwide players can cheat
Map.prototype.Serialize = function()
{
  return {
    name: 'map1',
    tiles: this._tiles,
    width: this._width,
    height: this._height,
  };
}

//// EXPORTS
module.exports = Map;