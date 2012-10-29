/*
 * GUI.js
 * @author: Leon Ho
 * This file contains factory methods for generating GUI entities
 */
var GUI = {};

Crafty.c('Button', {
	init: function(){
		this.requires("Mouse");
		this.isDown = false;
		this._onButtonDownFunc = undefined,
		this._onButtonOutFunc = undefined,
		this._onButtonUpFunc = undefined,

		this.bind("MouseDown", function()
		{
			if (!this.isDown) 
			{
				this.isDown = true;
				this._onButtonDownFunc();
			}
		});
		this.bind("MouseOut", function(){
			this.isDown = false;
			this._onButtonOutFunc();
		});
		this.bind("MouseUp", function(){
			if (this.isDown)
			{
				this.isDown = false;
				this._onButtonUpFunc();
			}
		});
		return this;
	},
	onButtonDown: function (func) {this._onButtonDownFunc = func; return this;},
	onButtonOut: function (func) {this._onButtonOutFunc = func; return this;},
	onButtonUp: function (func) {this._onButtonUpFunc = func; return this;},
})

// Creates a button with buttonText, which invokes handler(this) when clicked
GUI.Button = function(buttonText, handler)
{
	return Crafty.e(Properties.RENDERER + ", 2D, Color, Text, Button")
				.setName("button_" + buttonText)
				.attr({ w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
				.color(GUIDefinitions.BUTTON_UPCOLOR)
				.text(buttonText)
				.onButtonDown(function(){ this.color(GUIDefinitions.BUTTON_DOWNCOLOR); })
				.onButtonOut(function(){ this.color(GUIDefinitions.BUTTON_UPCOLOR); })
				.onButtonUp(function(){ this.color(GUIDefinitions.BUTTON_UPCOLOR); handler(this);});
};
/*
Crafty.c('SwitchButton', {
	init: function(){
		this.requires("Mouse");
		this.isDown = false;
		this._onButtonClickFunc = undefined,

		this.off = function()
		{
			this.isDown = false;
		};

		this.bind("Click", function()
		{
			this.isDown = this.isDown ? false : true;
			this._onButtonClickFunc(this, this.isDown);
		})
		return this;
	},
	onButtonClick: function (func) {this._onButtonClickFunc = func; return this;},
})*/

// Creates a switch button with buttonText, which invokes handler(this) when clicked
// button has true (selected) and false (not selected) state
GUI.SwitchButton = function(buttonText, handler)
{
	var button = Crafty.e(Properties.RENDERER + ", 2D, Color, Text, Mouse")
				.setName("button_" + buttonText)
				.attr({	isDown:false, w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
				.color(GUIDefinitions.BUTTON_UPCOLOR)
				.text(buttonText)
				.bind("Click", function()
				{
					if (!this.isDown) 
					{
						this.on();
					}
					else
					{
						this.off();
					}
					handler(this, this.isDown);
				});

	button.on = function()
	{
		this.isDown = true;
		this.color(GUIDefinitions.BUTTON_DOWNCOLOR);
	};
	button.off = function()
	{
		this.isDown = false;
		this.color(GUIDefinitions.BUTTON_UPCOLOR);
	};
	return button;
};

GUI.OneOrNoneRadioButtonGroup = function(buttonTextArray, handler)
{
	var buttons = [];

	function handler_Group( button, isOn )
	{
		for ( var i in buttons )
			buttons[ i ].off();

		if ( isOn )
			button.on();

		handler( buttons.indexOf( button ), isOn );
	}

	for ( var i in buttonTextArray )
	{
		var buttonText = buttonTextArray[ i ];
		buttons.push( GUI.SwitchButton( buttonText, handler_Group ) );
	}
	return buttons;
};

GUI.ACTION_BUTTON_A = 'A';
GUI.ACTION_BUTTON_B = 'B';

GUI.ActionButton = function(button)
{
	return Crafty.e(Properties.RENDERER + ", 2D, Button"); // add a action button sprite!
}

// Creates a joystick at posx, posy which moves the entity obj with speed
GUI.Joystick = function (posx, posy, obj, speed)
{
   var joystick = Crafty.e('Controller').attr({x:posx, y:posy});
    //obj.addComponent("Keyboard, Multiway").multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
   	obj.addComponent("Controllable").controllable(speed, undefined, undefined);
   	
   	return joystick;
}

GUI.RoomButton = function(data)
{
	// data should contain, ROOM INFO= NAME, ID, SETTINGS, STATUS (JOINED PLAYERS / TOTAL PLAYERS), LIST OF PLAYER INFO= NAME & STATUSES(COLOR/READY/TEAM)
	// only need to show summary NAME, STATUS
}
