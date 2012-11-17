/*
 * GUI.js
 * @author: Leon Ho
 * @author: Eldwin
 * This file contains factory methods for generating GUI entities
 */

/* ==============
 * GUI Initialize
 ================ */
var GUI = {
	pNumber:[]
};
// Create GUI sprites
var guiSpriteDef = SpriteDefinitions[SpriteDefinitions.GUI];
Crafty.sprite(guiSpriteDef['tile'], guiSpriteDef['file'], guiSpriteDef['elements']);

/* =============
 * GUI Constants
 =============== */
GUI.ACTION_BUTTON_A = 'A'; // defines action button A
GUI.ACTION_BUTTON_B = 'B'; // defines action button B
GUI.GAMETITLE_HEIGHT = 200;
GUI.GAMETITLE_WIDTH = 600;
GUI.STARTBUTTON_HEIGHT = 100;
GUI.STARTBUTTON_WIDTH = 200;
GUI.PLAYERBUTTON_HEIGHT = 80;
GUI.PLAYERBUTTON_WIDTH = 80;

/* ============
 * GUI Entities
 ============== */

 GUI.SpawnPlayerIcon = function(color)
{
	var def = SpriteDefinitions[color];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	var icon = Crafty.e(Properties.RENDERER + ", 2D, " + color + 'icon')
						.icon(color);

	return icon;
}

// Creates a button with buttonText, which invokes handler(this) when pressed.
GUI.Button = function(buttonText, handler)
{
	return Crafty.e(Properties.RENDERER + ", 2D, Image, Button")
				.setName("button_" + buttonText)
				.attr({ w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT, z:GUIDefinitions.Z_GUI })
				// .color(GUIDefinitions.BUTTON_UPCOLOR)
				// .text(buttonText)
				.image("/img/startbutton.png", "no-repeat")
				.onButtonDown(function(){ this.image("/img/startbuttonclicked.png", "no-repeat"); })
				.onButtonOut(function(){ this.image("/img/startbutton.png", "no-repeat"); })
				.onButtonUp(function(){ this.image("/img/startbutton.png", "no-repeat"); handler(this);});
};

// Create actions buttons for our game. Only 2 buttons A and B are defined.
GUI.ActionButton = function(button)
{
	var def = SpriteDefinitions['gui'];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	return Crafty.e(Properties.RENDERER + ", 2D, Button, eggButton, button" + button) // add a action button sprite!
			.setName("actionButton_" + button)
			.attr({w: SpriteDefinitions.CONTROLS_WIDTH, h: SpriteDefinitions.CONTROLS_HEIGHT, z:GUIDefinitions.Z_GUI})
			.areaMap([0,0], [300,0], [300,300], [0,300])
			.onButtonDown(function (){
				if (!Crafty.keydown[Crafty.keys[button]]) {
					Crafty.keyboardDispatch({'type':'keydown', 'keyCode' : Crafty.keys[button] });
					if (!dragons[GameState.GetLocalPlayer().GetID()].has('DodgeballPlayer')) {
						//console.log("playerID: " + GameState.GetLocalPlayer().GetID());
						//console.log("playerHasDodge: " + dragons[GameState.GetLocalPlayer().GetID()].has('DodgeballPlayer'));
						//console.log("I HAZ NO DIED")
						this.addComponent('eggButton');
					}
					else if (dragons[GameState.GetLocalPlayer().GetID()].hasFireball) {
						//console.log("I CAN HAZ FIREBALL")
						this.addComponent('fireballButton_down')
					}
					else {
						//console.log("I HAZ NO FIREBALL")
						this.addComponent('fireballButton_none')
					}
				}
			})
			.onButtonUp(function (){
				if (Crafty.keydown[Crafty.keys[button]]) {
					Crafty.keyboardDispatch({'type':'keyup', 'keyCode' : Crafty.keys[button] });
					if (!dragons[GameState.GetLocalPlayer().GetID()].has('DodgeballPlayer'))
						this.addComponent('eggButton');
					else if (dragons[GameState.GetLocalPlayer().GetID()].hasFireball) {
						this.addComponent('fireballButton')
					}
					else //if (dragons[GameState.GetLocalPlayer().GetID()].has('DodgeballPlayer')
						this.addComponent('fireballButton_none');
				}
			})
}

// Creates a dpad which moves the target entity with speed, and invokes button handlers when GUI.ACTION_BUTTON_A, or B is pressed.
GUI.Dpad = function (entity)
{
	var def = SpriteDefinitions['gui'];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
   	var dpad = Crafty.e('Controller, dpad_none')
   					.attr({z:GUIDefinitions.Z_GUI, w: SpriteDefinitions.CONTROLS_WIDTH, h: SpriteDefinitions.CONTROLS_HEIGHT})
   					.areaMap([0,0], [500,0], [500,500], [0,500])
   					.bind('KeyDown', function(e){
   						switch(e.keyCode)
   						{
   							case Crafty.keys["UP_ARROW"]:
   								this.addComponent('dpad_up');
   								break;
   							case Crafty.keys["DOWN_ARROW"]:
   								this.addComponent('dpad_down');
   								break;
   							case Crafty.keys["LEFT_ARROW"]:
   								this.addComponent('dpad_left');
   								break;
   							case Crafty.keys["RIGHT_ARROW"]:
   								this.addComponent('dpad_right');
   								break;	
   						}
   					})
   					.bind('KeyUp', function(e){
   						this.addComponent('dpad_none');
   					});
   	
   	return dpad;
}

// Creates a switch button with buttonText, which invokes handler(this) when clicked
// button has true (selected) and false (not selected) state
GUI.SwitchButton = function(buttonText, handler, color)
{
	var def = SpriteDefinitions['button'+color];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	var button = Crafty.e(Properties.RENDERER + ", 2D, Color, Mouse, SpriteAnimation, " + + color + 'button')
				.setName("button_" + buttonText)
				.animate("spin", def['anim_spin'])
				// .attr({	isDown:false, w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
				// .color(GUIDefinitions.BUTTON_UPCOLOR)
				.attr({	isDown:false})
				// .text(buttonText)
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
		if (!this.isPlaying("spin")) this.stop().animate("spin", 50, -1);
		// this.color(GUIDefinitions.BUTTON_DOWNCOLOR);
	};
	button.off = function()
	{
		this.isDown = false;
		if (this.isPlaying("spin")) this.stop();
		// this.color(GUIDefinitions.BUTTON_UPCOLOR);
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
		buttons.push( GUI.SwitchButton( buttonText, handler_Group, i ) );
	}
	return buttons;
};

// Creates a label and 2 < and > buttons, which invokes handler(this) when clicked
// 
GUI.Selector = function(choicesArray, handler)
{
	var index = 0;
	var choices = choicesArray;

	var label = Crafty.e(Properties.RENDERER + ", 2D, Color, Text, Mouse")
				.attr({	w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
				.text(choices[ index ])
				.textColor('#0000FF');

	var buttonLeft = Crafty.e(Properties.RENDERER + ", 2D, Color, Text, Mouse")
					.attr({	isDown:false, w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
					.text("<<<")
					.textColor('#FF0000')
					.bind("Click", function()
					{
						index = ( index == 0 ) ? choices.length - 1 : index - 1;
						label.text( choices[ index ] );
						handler(index);
					});

	var buttonRight = Crafty.e(Properties.RENDERER + ", 2D, Color, Text, Mouse")
					.attr({	isDown:false, w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
					.text(">>>")
					.textColor('#FF0000')
					.bind("Click", function()
					{
						index = ( index + 1 ) % choices.length;
						label.text(choices[ index ]);
						handler(index);
					});
	return { 'label': label, 'left': buttonLeft, 'right': buttonRight };
};

GUI.PlayerNumber = function(id)
{
	var def = SpriteDefinitions['player'+id];
	Crafty.sprite(def['tile'], def['file'], def['elements']);
	var player = Crafty.e(Properties.RENDERER + ", 2D, " + 'p' + id);
	return player;
};

GUI.GameTitle = function()
{
	
};

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

/*
 * @comp Controller is actually like a joystick
 * This component attempts to emulate touches using Crafty mouse events.
 * It then converts the touch to a key press which is used by @comp Controllable.
 */
Crafty.c('Controller', {
	init: function() {
	    this.requires(Properties.RENDERER + ", 2D, Mouse"); // bluedragon, can use sprite for controller image
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
		//console.log(angle);
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
	init: function(){
		this.requires("Multiway");
		this.multiway(1, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
		return this;
	},
})