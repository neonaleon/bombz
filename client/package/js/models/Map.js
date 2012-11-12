//// IMPORTS
var Bomb = require( './Bomb' );
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
  this._powerups = [];                // Powerup[] - list of powerups currently on map
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

Map.Default =
{
  POWERUPS: [
    Powerup.Type.BUFF_SPEED, Powerup.Type.BUFF_SPEED, 
    Powerup.Type.BUFF_RANGE, Powerup.Type.BUFF_RANGE,
    Powerup.Type.BUFF_CAPACITY, Powerup.Type.BUFF_CAPACITY,
    Powerup.Type.ABILITY_KICKBOMB, Powerup.Type.ABILITY_KICKBOMB
  ],
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
  var map = this;

  //var tile = GetTile( bomb.GetX(), bomb.GetY() );
  this._bombs.push( bomb );

  setTimeout( function()
  {

    map.HandleBomb( bomb );

  }, Bomb.DURATION );
}

Map.prototype.HandleBomb = function( bomb )
{
  console.log( "BOOM" );
  this.RemoveBomb( bomb );
}

// removes a bomb from the map
Map.prototype.RemoveBomb = function( bomb )
{
  this._bombs.splice( this._bombs.indexOf( bomb ), 1 );
}

// add a powerup to the map if it is a valid grid for a powerup
Map.prototype.AddPowerup = function( powerup )
{
  var tile = GetTile( powerup.GetX(), powerup.GetY() );
}

// removes a powerup from the map if it is a valid grid for a powerup
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
    var range = bomb.GetRange();
    var direction = directions[ index ];

    for ( var r = 1; r <= range; r++ )
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

  // spawn powerups
  var powerup_positions = [];
  var powerups = Map.Default.POWERUPS.slice();
  
  for ( var i = 0; i < powerups.length; i++ )
  {
    var pos, x, y;
    do 
    {
      // roll unique position
      pos = Math.floor( Math.random() * 116 );
      x = pos % 13 + 1;
      y = parseInt( pos / 13 ) + 1;
      
    } while ( powerup_positions.indexOf( pos ) > 0 || ( ( x % 2 !== 0 ) && ( y % 2 !== 0 ) ) )
    
    powerup_positions.push( pos );

    this._powerups.push( new Powerup( i, powerups[ i ], x, y ) );
  }
};

// representation
// used when map is just generated at start of game
// non-visible power ups (within blocks) are not included here otherwide players can cheat
Map.prototype.Serialize = function()
{
  var powerups = [];
  for ( var i = 0; i < this._powerups.length; i++ )
    powerups.push( this._powerups[ i ].Serialize() );

  return {
    name: 'map1',
    tiles: this._tiles,
    width: this._width,
    height: this._height,
    powerups: powerups,
  };
}

//// EXPORTS
module.exports = Map;