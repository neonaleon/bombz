
var GUI = {};

Crafty.c("Button", {
	isDown : false,
});

GUI.Button = function(buttonText, handler)
{				
	var btn = Crafty.e(Properties.RENDERER + ", 2D, Color, Mouse, Button")
					.setName("Button_" + buttonText)
					.color(GUIDefinitions.BUTTON_UPCOLOR)
					.attr({	w:GUIDefinitions.BUTTON_WIDTH, h:GUIDefinitions.BUTTON_HEIGHT })
					.bind("MouseDown", function(){
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
	return btn;
};
