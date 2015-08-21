//Heads Up Display

ig.module('game.HUD')
.requires('impact.game',
'game.entities.player'
)
.defines(function() {
	ig.HUD = ig.Class.extend({
		player: null,
		HPcoord: {x: 5, y: 5},
		missileCoord: { x: 3, y: 35},
		
		
		font: new ig.Font( 'media/04b03.font.png' ),
		missileSprite: new ig.Image('media/pickups/missileTransient.png'),
		
		
		
		init: function(player) {
			this.player = player;
			
		},
		
		draw: function() {
			
			this.font.draw("HP", this.HPcoord.x, this.HPcoord.y, ig.Font.ALIGN.LEFT);
			this.drawLifeOutline();
			this.drawLifeFill();
			if (this.player.missilesMax > 0) {
				this.drawMissileIndicator();
			}
		},
		
		drawLifeOutline: function() {
			ig.system.context.strokeStyle = 'rgba(255, 0, 0, 1)';
			ig.system.context.strokeRect(this.HPcoord.x, this.HPcoord.y + 20, ((this.player.healthMax)/1000)*ig.system.width, 30); 
		},
		
		drawLifeFill: function() {
			ig.system.context.fillStyle = 'rgba(255, 0, 0, 1)';
			ig.system.context.fillRect(this.HPcoord.x, this.HPcoord.y + 20, ((this.player.health)/1000)*ig.system.width, 30);
		},
		
		drawMissileIndicator: function() {
			this.missileSprite.draw(this.missileCoord.x, this.missileCoord.y);
			this.font.draw(this.player.currentMissiles, this.missileCoord.x + 15, this.missileCoord.y, ig.Font.ALIGN.LEFT);
		},
		
		
	});
});