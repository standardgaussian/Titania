//pause screen
//provide stats and options
//start with plain stats and make sure it works/transitions back to normal gameplay, then add functionality

ig.module('game.pause')
.requires('impact.game', 'impact.font')
.defines (function() {
	PauseScreen = ig.Game.extend({ 
		gameState: null,
		pauseBG: new ig.Image('media/stat-matte.png'),
		pauseText : new ig.Font('media/04b03.font.png'),
		
		init: function() {
		},
		
		update: function() {
			//listen for input to return to game
			if (ig.input.pressed('pause')) {
				this.restoreGame();
			}
			
		},
		
		draw: function() {
			this.parent();
			//draw pause screen background
			//stolen from Resident Raver for now
			this.pauseBG.draw(0,0);
			//super-impose stats
			//just tell me it's Paused for now
			this.pauseText.draw('PAUSED', ig.system.width/2, ig.system.height/2, ig.Font.ALIGN.CENTER);
			
		},
		
		//this doesn't seem like it would work...
		//and if it does, it seems to leave an instance of pause hanging
		restoreGame: function() {
			ig.game = ig.global.gameState;
			ig.system.setDelegate(ig.game);
		}
	});
});