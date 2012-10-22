
var GUI = {};

GUI.Button = function(buttonText, handler)
{
	return Crafty.e(Properties.RENDERER + ", 2D, Color, Text, Mouse")
				.setName("button_" + buttonText)
				.attr({	isDown:false, w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
				.color(GUIDefinitions.BUTTON_UPCOLOR)
				.text(buttonText)
				.bind("MouseDown", function()
				{
					if (!this.isDown) 
					{
						this.isDown = true;
						this.color(GUIDefinitions.BUTTON_DOWNCOLOR);
					}
				})
				.bind("MouseOut", function(){
					this.isDown = false;
					this.color(GUIDefinitions.BUTTON_UPCOLOR);
				})
				.bind("MouseUp", function(){
					if (this.isDown)
					{
						this.isDown = false;
						this.color(GUIDefinitions.BUTTON_UPCOLOR);
						handler(this);
					}
				});
};

GUI.RoomButton = function(data)
{
	// data should contain, ROOM INFO= NAME, ID, SETTINGS, STATUS (JOINED PLAYERS / TOTAL PLAYERS), LIST OF PLAYER INFO= NAME & STATUSES(COLOR/READY/TEAM)
	// only need to show summary NAME, STATUS
}
