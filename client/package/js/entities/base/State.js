function State()
{
  this._room;
  this._player;
};


State.prototype.GetRoom = function()
{
	return this._room;
}

State.prototype.GetPlayer = function()
{
	return this._room;
}

State.prototype.JoinRoom = function( object )
{
	this._room = new Room();
	this._room.Deserialize( object );

    // add this._player to room
	//this._player = new Player( id )
	//this._room.AddPlayer( this._player );
}

State.prototype.LeaveRoom = function()
{
	this._room = undefined;
	this._player = undefined;
}

var state = new State();