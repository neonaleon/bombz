/*
 * GUI.js
 * @author: Leon Ho
 * This file contains factory methods for generating GUI entities
 */

/* ==============
 * GUI Initialize
 ================ */
var GUI = {};
// Create GUI sprites
var guiSpriteDef = SpriteDefinitions[SpriteDefinitions.GUI];
Crafty.sprite(guiSpriteDef['tile'], guiSpriteDef['file'], guiSpriteDef['elements']);

/* =============
 * GUI Constants
 =============== */
GUI.ACTION_BUTTON_A = 'A'; // defines action button A
GUI.ACTION_BUTTON_B = 'B'; // defines action button B

/* ============
 * GUI Entities
 ============== */
// Creates a button with buttonText, which invokes handler(this) when pressed.
GUI.Button = function(buttonText, handler)
{
	return Crafty.e(Properties.RENDERER + ", 2D, Color, Text, Button")
				.setName("button_" + buttonText)
				.attr({ w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT, z:GUIDefinitions.Z_INDEX })
				.color(GUIDefinitions.BUTTON_UPCOLOR)
				.text(buttonText)
				.onButtonDown(function(){ this.color(GUIDefinitions.BUTTON_DOWNCOLOR); })
				.onButtonOut(function(){ this.color(GUIDefinitions.BUTTON_UPCOLOR); })
				.onButtonUp(function(){ this.color(GUIDefinitions.BUTTON_UPCOLOR); handler(this);});
};

// Create actions buttons for our game. Only 2 buttons A and B are defined.
GUI.ActionButton = function(button)
{
	return Crafty.e(Properties.RENDERER + ", 2D, Button, button" + button) // add a action button sprite!
			.setName("actionButton_" + button)
			.attr({z:GUIDefinitions.Z_INDEX})
			.onButtonDown(function (){
				if (!Crafty.keydown[Crafty.keys[button]])
					Crafty.keyboardDispatch({'type':'keydown', 'keyCode' : Crafty.keys[button] });
			})
			.onButtonUp(function (){
				if (Crafty.keydown[Crafty.keys[button]]) 
					Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys[button] });
			})
}

// Creates a dpad which moves the target entity with speed, and invokes button handlers when GUI.ACTION_BUTTON_A, or B is pressed.
GUI.Dpad = function (entity, speed, aHandler, bHandler)
{
   var dpad = Crafty.e('Controller, dpad').attr({z:GUIDefinitions.Z_INDEX});
   
   	entity.addComponent("Controllable").controllable(speed, aHandler, bHandler);
   	
   	return dpad;
}

/* ==============
 * GUI Components
 ================ */
/*
 * @comp Button converts touch(emulated using mouse) events into button actions such as Button Up, Down, Out
 * Button action handlers are defined by the entity that contains @comp Button, and are invoked accordingly.
 */
Crafty.c('Button', {
	init: function(){
		this.requires("Mouse");
		this.isDown = false;
		this._onButtonDownFunc = function(){},
		this._onButtonOutFunc = function(){},
		this._onButtonUpFunc = function(){},

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

/*
 * @comp Controller is actually like a joystick
 * This component attempts to emulate touches using Crafty mouse events.
 * It then converts the touch to a key press which is used by @comp Controllable.
 */
Crafty.c('Controller', {
	init: function() {
	    this.requires(Properties.RENDERER + ", 2D, Mouse"); // bluedragon, can use sprite for controller image
		/*
		this.attr({isDown:false, w:100, h:100, z:100});
		this.color("#00FF00");
		*/
		this.bind("MouseDown", function(mouseEvent){
			this.isDown = true;
			this._resolveKey(mouseEvent);
		})
		this.bind("MouseUp", function(mouseEvent){
			this.isDown = false;
			this._resetKeys();
		})
		this.bind("MouseOut", function(mouseEvent){
			this.isDown = false;
			this._resetKeys();
		})
		this.bind("MouseMove", function(mouseEvent){
			this._resetKeys();
			this._resolveKey(mouseEvent);
		})
		return this;
	},
	// cache vectors for angle computation
	_xAxis: new Crafty.math.Vector2D(1, 0),
	_tempVec: new Crafty.math.Vector2D(0, 0),
	// resets key presses
	_resetKeys: function(){
		if (Crafty.keydown[Crafty.keys['RIGHT_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['RIGHT_ARROW'] });
		if (Crafty.keydown[Crafty.keys['LEFT_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['LEFT_ARROW'] });
		if (Crafty.keydown[Crafty.keys['UP_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['UP_ARROW'] });
		if (Crafty.keydown[Crafty.keys['DOWN_ARROW']]) Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys['DOWN_ARROW'] });
	},
	// resolves MouseDown or MouseMove events to a key press
	_resolveKey: function(mouseEvent){
		var x = mouseEvent.clientX;
		var y = mouseEvent.clientY;
		var dx = x - this.x - this.w/2;
		var dy = y - this.y - this.h/2;
		var angle = this._tempVec.setValues(dx, dy).angleBetween(this._xAxis);
		if (this.isDown)
		{
			if (Math.abs(angle) < Math.PI/4 && !Crafty.keydown[Crafty.keys['RIGHT_ARROW']]) Crafty.keyboardDispatch({'type':'keydown', 'keyCode' : Crafty.keys['RIGHT_ARROW'] });
			if (Math.abs(angle) > Math.PI*3/4 && !Crafty.keydown[Crafty.keys['LEFT_ARROW']]) Crafty.keyboardDispatch({'type':'keydown', 'keyCode' : Crafty.keys['LEFT_ARROW'] });
			if (Math.PI/4 < angle && angle < Math.PI*3/4 && !Crafty.keydown[Crafty.keys['UP_ARROW']]) Crafty.keyboardDispatch({'type':'keydown', 'keyCode' : Crafty.keys['UP_ARROW'] });
			if (-Math.PI*3/4 < angle && angle < -Math.PI/4 && !Crafty.keydown[Crafty.keys['DOWN_ARROW']]) Crafty.keyboardDispatch({'type':'keydown', 'keyCode' : Crafty.keys['DOWN_ARROW'] });
		}
	},
})

/*
 * @comp Controllable is used in conjuction with @comp Controller
 * Key presses generated by the controller is handled by controllable.
 * 
 */
Crafty.c('Controllable', {
	_aHandler: undefined,
	_bHandler: undefined,
	init: function(){
		this.requires("Keyboard, Multiway");
		
		this.bind('KeyDown', function(keyEvent){
			if (keyEvent.key == Crafty.keys['A'])
				this._aHandler();
			if (keyEvent.key == Crafty.keys['B'])
				this._bHandler();
		});
		
		return this;
	},
	controllable: function(speed, aHandler, bHandler){
		this._aHandler = aHandler;
		this._bHandler = bHandler;
		this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
		return this;
	}
})
