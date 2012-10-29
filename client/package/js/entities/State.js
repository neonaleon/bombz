function State()
{
  this._room = undefined;
  this._player = undefined;
};


State.prototype.GetRoom = function()
{
	return this._room;
}

State.prototype.GetPlayer = function()
{
	return this._room;
}

State.prototype.JoinRoom = function( data )
{
	var room = new Room();
	room.Deserialize( data );

	console.log(data);

    this._room = room;
	this._player = room.GetPlayer( data.pid );

    console.log(this);
}

State.prototype.LeaveRoom = function()
{
	this._room = undefined;
	this._player = undefined;
}

var GameState = new State();