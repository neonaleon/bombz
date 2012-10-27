//// IMPORTS


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
  this._powerups = [];                // Powerup[] - list of powerups currently on map


//// CONSTRAINTS
  if ( ( width * height ) != tiles.length )
  {
    console.log( 'Invalid map parameters - number of tiles do not match width and height of map.' );
  }
}


//// CONSTANTS
Map.Tile =
{
  EMPTY: 0,
  BLOCK_DESTRUCTIBLE: 1,
  BLOCK_INDESTRUCTIBLE: 2,
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

// representation
// used when map is just generated at start of game
// non-visible power ups (within blocks) are not included here otherwide players can cheat
Map.prototype.Serialize = function()
{
  return {
    tiles: this._tiles,
    width: this._grid_width,
    height: this._grid_height,
  };
}

//// EXPORTS
module.exports = Map;