/*
 * Controller.js
 * 
 */
Crafty.c('ActionButton', {
	init: function(){
		this.requires(Properties.RENDERER + ", 2D, Color, Mouse");
		
		return this;
	}
})

Crafty.c('Controller', {
	init: function() {
	    this.requires(Properties.RENDERER + ", 2D, Color, Mouse"); // bluedragon, can use sprite for controller image
		
		this.attr({w:50, h:50, z:100});
		this.color("#00FF00");
		
		this.bind("MouseDown", function(mouseEvent){
			//Crafty.keyboardDispatch({'type':'keydown', 'keyCode' : Crafty.keys['RIGHT_ARROW'] });
			var x = mouseEvent.clientX,
				y = mouseEvent.clientY;
			console.log(x, y);
      		//pos = Crafty.DOM.translate(x, y);
		})
		this.bind("MouseUp", function(){
			
		})
		this.bind("MouseMove", function(){
			
		})
		return this;
	},
})

Crafty.c('Controllable', {
	_aHandler: undefined,
	_bHandler: undefined,
	init: function(){
		this.requires("Keyboard, Multiway");
		
		this.bind('KeyDown', function(keyEvent){
			if (keyEvent.key == Crafty.keys['A'])
				_aHandler();
			if (keyEvent.key == Crafty.keys['B'])
				_bHandler();
		});

		return this;
	},
	setSpeed: function(speed){
		return this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
	},
	setActionA: function(handler){
		_aHandler = handler;		
	},
	setActionB: function(handler){
		_bHandler = handler;
	}
})
