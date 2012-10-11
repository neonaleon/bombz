function Player()
{
	this.sid;		// Socket id. Used to uniquely identify players via the socket they are connected from [Public]
    this.pid;		// Player id. In this case, 1 or 2 [Public]

    /*===========
	  Constructor
	  ===========*/
    //this.sid = sid;
    //this.pid = pid;

	this.get = function()
	{

	};
}

global.Player = Player;