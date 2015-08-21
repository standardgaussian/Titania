//title menu

ig.module('game.title')
.requires('impact.game', 'plugins.local', 'game.save', 'plugins.gamepad'
)
.defines(function() {
	Title = ig.Game.extend({
		
		titleFont: new ig.Font( 'media/04b03.font.png' ),
		stop : 0,
		
		
		init() {
			//has own input bindings?
			ig.input.bind(ig.KEY.X, 'newgame');
			ig.input.bind(ig.KEY.C, 'continue');
			
			
		},
		
		draw: function() {
			this.parent();
			this.titleFont.draw("TheLoop", ig.system.width/2, ig.system.height/2, ig.Font.ALIGN.CENTER);
			this.titleFont.draw("New Game : Press X", ig.system.width/6, 3*ig.system.height/4, ig.Font.ALIGN.LEFT);
			this.titleFont.draw("Continue : Press C", 5*ig.system.width/6, 3*ig.system.height/4, ig.Font.ALIGN.RIGHT);
			
		},
		
		update: function() {
			if (this.stop == 1) {
				return;
			}
			if (ig.input.pressed('newgame')) {
				ig.system.setGame(LoopMain);
			}
			else if (ig.input.pressed('continue')) {
			}
		},

	});
});