//// IMPORTS
var Map = require( './../client/package/js/models/Map' );
var Room = require( './../client/package/js/models/Room' );
var Bomb = require( './../client/package/js/models/Bomb' );
var Player = require( './../client/package/js/models/Player' );
var Powerup = require( './../client/package/js/models/Powerup' );
var MessageDefinitions = require( './../client/package/js/definitions/MessageDefinitions' );


function RoomController( id )
{
//// PRIVATE VARIABLES
  //this._map                     // Map
  this._room = new Room( id );

  this.Reset();
}


//// PUBLIC FUNCTIONS
RoomController.prototype.Reset = function( socket )
{
  this._room.Reset();
  this._powerupQueue = {};        // holds powerup pickup requests for a short while to see if anyone picked it earlier
  this._map = new Map( 19, 15, 40, 40 );
  clearTimeout( this._suddenDeathtimer );
}

RoomController.prototype.GetPlayerFromSocket = function( socket )
{
  var players = this._room.GetPlayers();
  for ( var i in players )
    if ( players[ i ].GetSocket() === socket )
      return players[ i ];

  return undefined;
}

RoomController.prototype.SendDelayed = function( socket, message, data, delay )
{
  setTimeout( function()
  {
    socket.emit( message, data );
  }, delay );
}

RoomController.prototype.Broadcast = function( message, data, excludeSocket )
{
  var players = this._room.GetPlayers();
  for ( var i in players )
    if ( players[ i ].GetSocket() !== excludeSocket )
      players[ i ].GetSocket().emit( message, data );
}

RoomController.prototype.FairBroadcast = function( message, data )
{
  var delays = [];
  var players = this._room.GetPlayers();
  for ( var i in players )
  {
    var player = players[ i ];
    delays.push( { player: player, delay: player.GetDelay() } );
  }

  // sort in to descending delay, slowest to fastest player
  delays.sort( function( a, b )
  {
    return b.delay - a.delay;
  });
  
  // delay everyone's packet relative to slowest player
  for ( var i = 0; i < delays.length; i++ )
  {
    var entry = delays[ i ];
    var player = entry.player;
    var delay = delays[ 0 ].delay - entry.delay;
    this.SendDelayed( player.GetSocket(), message, data, delay );
  }
}

// add player to room - only possible during WAITING state
RoomController.prototype.AddPlayer = function( socket )
{
  if ( this._room.GetState() == Room.State.PLAYING )
    return;

  if ( this._room.GetPlayerCount() >= Room.MAX )
    return;

  // player is already in game
  var players = this._room.GetPlayers();
  for ( var i in players )
    if ( players[ i ].GetSocket() === socket )
      return;

  var pid = this._room.GetNextAvailablePlayerID();
  var player = new Player( pid, socket );
  this._room.AddPlayer( player );

  this.CreatePlayerListeners( socket );

  // send update to everyone else but new player since he would have gotten it from room message
  this.Broadcast( MessageDefinitions.UPDATE, this.Serialize(), socket );
}

// remove player from room
RoomController.prototype.RemovePlayer = function( socket )
{
  var player = this.GetPlayerFromSocket( socket );
  
  if ( player === undefined )
    return;

  this._room.RemovePlayer( player );
  this.RemovePlayerListeners( socket );

  if ( this._room.GetState() === Room.State.WAITING ) // waiting room
  {
    this.Broadcast( MessageDefinitions.UPDATE, this.Serialize(), socket );
  }
  else // game room
  {
    this.Broadcast( MessageDefinitions.LEAVE, { id: player.GetID() }, socket );

    // all players left room, reset it to waiting state. otherwise, check if anyone has won or powerups need to drop
    if ( this._room.GetPlayerCount() === 0 )
    {
      this.Reset();
    }
    else if ( this._room.GetPlayerCount() === 1 )
    {
      var player;
      var players = this._room.GetPlayers();
      for ( var i in players )
        player = players[ i ];

      this.Broadcast( MessageDefinitions.WIN, { pid: player.GetID() } );
      this.EndGame();
    }
  }
}

// start the game
RoomController.prototype.CanStartGame = function()
{
  var room = this._room;

  // must be full room
  //if ( room.GetPlayerCount() != Room.MAX )
  //  return false;

  // check that everyone has chosen their colors and all different
  var colors = {};
  var players = room.GetPlayers();
  for ( var i in players )
  {
    var color = players[ i ].GetColor();

    if ( color === Player.Color.NONE || color in colors )
    {
      return false;
    }
    else
    {
      colors[ color ] = color;
    }
  }
  return true;
};

RoomController.prototype.StartGame = function()
{
  var room = this._room;
  var roomController = this;

  this._suddenDeathtimer = setTimeout( function()
  {
     roomController.FairBroadcast( MessageDefinitions.SUDDEN_DEATH );
  }, Room.Settings.Timeout.TWO_HALF_MINUTES );

  // spawn normal powerups
  setInterval( function()
  {
    if ( room.GetState() !== Room.State.PLAYING )
      return;

    if ( roomController.GetMap().GetNonFireballPowerupCount() < Powerup.MAX_IN_PLAY )
    {
      var powerup = roomController.GetMap().SpawnPowerup();
      roomController.FairBroadcast( MessageDefinitions.POWERUP, powerup.Serialize() );
    }

    if ( roomController.GetMap().GetFireballPowerupCount() < Powerup.MAX_FIREBALL_IN_PLAY )
    {
      var powerup = roomController.GetMap().SpawnFireballPowerup();
      roomController.FairBroadcast( MessageDefinitions.POWERUP, powerup.Serialize() );
    }

  }, Powerup.SPAWN_RATE );

  // spawn fireball powerups
  setInterval( function()
  {
    if ( room.GetState() !== Room.State.PLAYING )
      return;

    if ( roomController.GetMap().GetFireballPowerupCount() < Powerup.MAX_FIREBALL_IN_PLAY )
    {
      var powerup = roomController.GetMap().SpawnFireballPowerup();
      roomController.FairBroadcast( MessageDefinitions.POWERUP, powerup.Serialize() );
    }

  }, Powerup.FIREBALL_SPAWN_RATE );
};

// end the game
RoomController.prototype.EndGame = function()
{
  var room = this._room;
  var roomController = this;

  if ( room.GetState() === Room.State.PLAYING )
  {
    var players = room.GetPlayers();

    for ( var i in players )
      players[ i ].Reset();

    // remove waiting state listeners
    for ( var i in players )
      roomController.RemovePlayerListeners( players[ i ].GetSocket() );

    room.SetState( Room.State.WAITING );

    // add playing state listeners
    for ( var i in players )
      roomController.CreatePlayerListeners( players[ i ].GetSocket() );

    this._map = new Map( 19, 15, 40, 40 );
  }
};

// creates listeners specific to this state for a player
RoomController.prototype.CreatePlayerListeners = function( socket )
{
  var room = this._room;
  var roomController = this;

  if ( room.GetState() === Room.State.WAITING )
  {
    // client indicates he is ready to play
    socket.on( MessageDefinitions.START, function( data )
    {
      if ( roomController.CanStartGame() )
      {
        roomController.GetMap().Generate();
        roomController.Broadcast( MessageDefinitions.START, { map: roomController.GetMap().Serialize() } );

        var players = room.GetPlayers();

        // remove waiting state listeners
        for ( var i in players )
          roomController.RemovePlayerListeners( players[ i ].GetSocket() );

        room.SetState( Room.State.PLAYING );

        // add playing state listeners
        for ( var i in players )
          roomController.CreatePlayerListeners( players[ i ].GetSocket() );

        // start game
        roomController.StartGame();
      }
    });

    // client requests a color change
    socket.on( MessageDefinitions.SEAT, function( data )
    {
      var color;
      switch ( data.color )
      {
        case Player.Color.BLUE:
        case Player.Color.GREEN:
        case Player.Color.RED:
        case Player.Color.PINK:
          color = data.color;
          break;

        default:
          color = Player.Color.NONE;
          break;
      }

      var player = roomController.GetPlayerFromSocket( socket );
      player.SetColor( color );

      roomController.Broadcast( MessageDefinitions.UPDATE, roomController.Serialize() );
      //roomController.Broadcast( 'seat', { id: player.GetID(), color: color } );
    });
  }
  else
  {
    socket.on( MessageDefinitions.TIME, function( data )
    {
      var time = ( new Date() ).getTime();
      if ( data.timestamp !== undefined )
      {
        var delay = time - data.timestamp;
        roomController.GetPlayerFromSocket( socket ).SetDelay( delay );
      }
      else if ( data.clientTime !== undefined )
      {
        data.serverTime = time;
        socket.emit( MessageDefinitions.TIME, data );
      }
    });

    // player moves
    socket.on( MessageDefinitions.MOVE, function( data )
    {
      var player = roomController.GetPlayerFromSocket( socket );
      player.SetDirection( data.dir );
      player.SetPosition( data.x, data.y );

      var delay = ( new Date() ).getTime() - data.timestamp;
      player.WeightedAverageDelay( delay );

      data.pid = player.GetID();
      data.speed = player.GetSpeed();
      roomController.Broadcast( MessageDefinitions.MOVE, data, socket );
    });

    // player plants a bomb
    socket.on( MessageDefinitions.BOMB, function( data )
    {
      var player = roomController.GetPlayerFromSocket( socket );

      // set timer till bomb explodes and check again??
      data.owner = player.GetID();
      data.range = player.GetBombRange();
      roomController.Broadcast( MessageDefinitions.BOMB, data, socket );
    });

    // player shoots a fireball
    socket.on( MessageDefinitions.FIREBALL, function( data )
    {
      data.pid = roomController.GetPlayerFromSocket( socket ).GetID();
      roomController.Broadcast( MessageDefinitions.FIREBALL, data, socket );
    });

    // player picks a fireball
    socket.on( MessageDefinitions.POWERUP, function( data )
    {
      var powerup = roomController.GetMap().GetPowerup( data.x, data.y );

      if ( powerup === undefined )
        return;

      var player = roomController.GetPlayerFromSocket( socket );
      data.pid = player.GetID();
      data.type = powerup.GetType();

      // need to put into queue instead
      var key = data.x + ', ' + data.y;
      if ( key in roomController._powerupQueue )
      {
        var queue = roomController._powerupQueue[ key ];
        queue.push( data );
      }
      else
      {
        roomController._powerupQueue[ key ] = [ data ];
        roomController.HandlePowerupQueue( key, room.GetAverageDelay() );
      }

      /*
      // original method of directly handling, now delayed to HandlePowerupQueue
      var player = roomController.GetPlayerFromSocket( socket );
      data.pid = player.GetID();
      data.type = powerup.GetType();
      powerup.ApplyEffect( player );
      roomController.GetMap().RemovePowerup( powerup );
      roomController.Broadcast( MessageDefinitions.POWERUP, data );
      */
    });

    // player dies
    socket.on( MessageDefinitions.DEATH, function( data )
    {
      var player = roomController.GetPlayerFromSocket( socket );
      player.Reset();
      player.SetAlive( false );

      data.pid = player.GetID();

      // random position in the dodgeball pit to send dead player
      var position = roomController.GetMap().RandomDodgeballSpawnPosition();
      data.x = position.x;
      data.y = position.y;

      roomController.Broadcast( MessageDefinitions.DEATH, data );

      // check for winners
      var alive = room.GetAlivePlayers();
      if ( alive.length === 1 )
      {
        roomController.Broadcast( MessageDefinitions.WIN, { pid: alive[ 0 ].GetID() } );
        roomController.EndGame();
      }
    });
  }
}

// removes listeners specific to this state for a player
RoomController.prototype.HandlePowerupQueue = function( key, delay )
{
  var room = this._room;
  var roomController = this;

  setTimeout( function()
  {
    var queue = roomController._powerupQueue[ key ];

    queue.sort( function( a, b )
    {
      return a.timestamp - b.timestamp;
    });

    // take earliest timestamped packet
    var data = queue[ 0 ];
    var player = room.GetPlayer( data.pid );
    var powerup = roomController.GetMap().GetPowerup( data.x, data.y );
    powerup.ApplyEffect( player );
    roomController.GetMap().RemovePowerup( powerup );
    roomController.Broadcast( MessageDefinitions.POWERUP, data );

    // remove queue for this powerup
    delete roomController._powerupQueue[ key ];
  }, delay );
}

// removes listeners specific to this state for a player
RoomController.prototype.RemovePlayerListeners = function( socket )
{
  if ( this._room.GetState() === Room.State.WAITING )
  {
    socket.removeAllListeners( MessageDefinitions.SEAT );
    socket.removeAllListeners( MessageDefinitions.START );
    socket.removeAllListeners( MessageDefinitions.UPDATE );
  }
  else
  {
    socket.removeAllListeners( MessageDefinitions.MOVE );
    socket.removeAllListeners( MessageDefinitions.TIME );
    socket.removeAllListeners( MessageDefinitions.BOMB );
    socket.removeAllListeners( MessageDefinitions.KICK );
    socket.removeAllListeners( MessageDefinitions.DEATH );
    socket.removeAllListeners( MessageDefinitions.POWERUP );
    socket.removeAllListeners( MessageDefinitions.FIREBALL );
  }
}

RoomController.prototype.GetMap = function()
{
  return this._map;
}

RoomController.prototype.GetState = function()
{
  return this._room.GetState();
}

// representation
// used to bring a player who just joined waiting room up to date
RoomController.prototype.Serialize = function( socket )
{
  var data = {};
  data.room = {};
  data.room.players = [];

  var players = this._room.GetPlayers();
  for ( var i in players )
  {
    var player = players[ i ];
    data.room.players[ player.GetID() ] = player.GetColor();
  }

  if ( socket !== undefined )
  {
    data.pid = this.GetPlayerFromSocket( socket ).GetID();
  }

  return data;
};

//// EXPORTS
module.exports = RoomController;