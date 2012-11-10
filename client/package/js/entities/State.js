function State()
{
	this._pid = undefined;
	this._room = undefined;
	this._map = undefined;
};

State.prototype.GetMap = function()
{
	return this._map;
}

State.prototype.SetMap = function( map )
{
	this._map = map;
}

State.prototype.GetRoom = function()
{
	return this._room;
}

State.prototype.GetLocalPlayer = function()
{
	return this._room.GetPlayer( this._pid );
}

State.prototype.UpdateRoom = function( data )
{
	var room = new Room();
	room.Deserialize( data.room );
	this._room = room;

	if ( data.pid !== undefined )
		this._pid = data.pid;
}

State.prototype.LeaveRoom = function()
{
	this._pid = undefined;
	this._room = undefined;
}

var GameState = new State();