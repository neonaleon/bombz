/*
 * GUI.js
 * @author: Leon Ho
 * This file contains factory methods for generating GUI entities
 */



var GUI = {};

// Creates a button with buttonText, which invokes handler(this) when clicked
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

GUI.TexturedButton = function ()
{
	
};

// Creates a joystick at posx, posy which moves the entity obj with speed
GUI.Joystick = function (posx, posy, obj, speed)
{
	// INCOMPLETE, NEED TO SET X, Y, W, H, according to image we are going to use
	var stick = Crafty.e(Properties.RENDERER + ", 2D, Image").attr({
                x: posx+5,
                y: posy+5,
                w: 50,
                h: 50,
                z: 1              
    }).image("http://cdn1.iconfinder.com/data/icons/function_icon_set/circle_green.png");

    var track = Crafty.e(Properties.RENDERER + ", 2D, Image, Joystick, Text").attr({
        x: posx,
        y: posy,
        w: 64,
        h: 64       
    }).image("http://cdn1.iconfinder.com/data/icons/softwaredemo/PNG/64x64/Circle_Grey.png")
    .joystick(stick, {mouseSupport: true, range: 20})
    .attach(stick);
    
    obj.addComponent("Keyboard, Multiway").multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
    
    return track;
}

GUI.RoomButton = function(data)
{
	// data should contain, ROOM INFO= NAME, ID, SETTINGS, STATUS (JOINED PLAYERS / TOTAL PLAYERS), LIST OF PLAYER INFO= NAME & STATUSES(COLOR/READY/TEAM)
	// only need to show summary NAME, STATUS
}
