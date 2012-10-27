// TESTS

//// IMPORTS
var Map = require( './Map' );
var Bomb = require( './Bomb' );
var Room = require( './Room' );
var Player = require( './Player' );
var Powerup = require( './Powerup' );


console.log( "Bomb" );
console.log( "----" );
var bomb = new Bomb( 0, 0, 0 );
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