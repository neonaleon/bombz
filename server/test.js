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
var powerup = new Powerup( 0, 0, 0 );
console.log( "powerup:", powerup.Serialize() );
console.log();


console.log( "Player" );
console.log( "------" );
var player = new Player( 0, 0 );
console.log( "player:", player.Serialize() );
console.log();