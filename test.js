// TESTS

//// IMPORTS
var Map = require( './Map' );
var Bomb = require( './Bomb' );
var Room = require( './Room' );
var Player = require( './Player' );
var Powerup = require( './Powerup' );


console.log( "Bomb" );
console.log( "----" );
var bomb = new Bomb( 0, 0, 0, 0 );
console.log( "bomb:", bomb.Serialize() );
console.log();


console.log( "Powerup" );
console.log( "-------" );
var powerup_speed = new Powerup( 0, 0, Powerup.Type.BUFF_SPEED );
var powerup_range = new Powerup( 1, 5, Powerup.Type.BUFF_RANGE );
var powerup_capacity = new Powerup( 2, 6, Powerup.Type.BUFF_CAPACITY );
var powerup_kickbomb = new Powerup( 2, 8, Powerup.Type.ABILITY_KICKBOMB );
console.log( "powerup:", powerup_speed.Serialize() );
console.log( "powerup:", powerup_range.Serialize() );
console.log( "powerup:", powerup_capacity.Serialize() );
console.log( "powerup:", powerup_kickbomb.Serialize() );
console.log();


console.log( "Player" );
console.log( "------" );
var player = new Player( 0, 0 );
player.PickPowerup( powerup_speed );
player.PickPowerup( powerup_range );
console.log( "Dropped powerups:", player.DropAllPowerups() );
player.PickPowerup( powerup_kickbomb );
console.log( "Dropped powerups:", player.DropAllPowerups() );
player.PickPowerup( powerup_capacity );
console.log( "player:", player.Serialize() );
player.Reset();
console.log( "player:", player.Serialize() );
console.log();


console.log( "Map" );
console.log( "---" );
var map = new Map( 8, 8, 16, 16,
	[ 1, 1, 1, 1, 1, 1, 1, 1,
	  1, 0, 0, 0, 0, 0, 0, 1,
	  1, 0, 1, 0, 0, 1, 0, 1,
	  1, 0, 0, 0, 0, 0, 0, 1,
	  1, 0, 0, 0, 0, 0, 0, 1,
	  1, 0, 1, 0, 0, 1, 0, 1,
	  1, 0, 0, 0, 0, 0, 0, 1,
      1, 1, 1, 1, 1, 1, 1, 1, ] );
console.log( "point (31, 31) = grid (" + map.ConvertPointToGrid( 31, 31 ).x + ", " + map.ConvertPointToGrid( 31, 31 ).y + ")" );
//console.log( "map:", map.Serialize() );

//console.log( "2. test of map x, y, to tile array")
var map2 = new Map( 8, 8, 16, 16,
	[ 0,   1,  2,  3,  4,  5,  6,  7,
	  8,   9, 10, 11, 12, 13, 14, 15,
	  16, 17, 18, 19, 20, 21, 22, 23,
	  24, 25, 26, 27, 28, 29, 30, 31,
	  32, 33, 34, 35, 36, 37, 38, 39,
	  40, 41, 42, 43, 44, 45, 46, 47,
	  48, 49, 50, 51, 52, 53, 54, 55,
      56, 57, 58, 59, 60, 61, 62, 63, ] );
/*
for ( var j = 0; j < 8; j++ )
  for ( var i = 0; i < 8; i++ )
    console.log( "GetTile( " + i + ", " + j + " ) = " + map2.GetTile( i, j ) );
*/