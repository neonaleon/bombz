var WallClock = {
	_delta: undefined,
};


WallClock.sync = function()
{
	var wallClock = this;

	NetworkManager.AddListener(MessageDefinitions.TIME, function( data )
	{
		var time = ( new Date() ).getTime();
		var RTT = time - parseInt( data.clientTime );
		var delay = parseInt( RTT / 2 );

		wallClock._delta = parseInt( data.serverTime ) - time + delay;

		NetworkManager.ClearListeners(MessageDefinitions.TIME);

		data.timestamp = wallClock.getTime();
		NetworkManager.SendMessage(MessageDefinitions.TIME, data );
	});
	NetworkManager.SendMessage(MessageDefinitions.TIME, { clientTime: ( new Date() ).getTime() } );
}


WallClock.getTime = function()
{
	return parseInt( ( new Date() ).getTime() + this._delta );
};