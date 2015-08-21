//save point
//no graphic, super-impose dummy save graphic onto it

ig.module('game.entities.savePoint').
requires('impact.entity', 'game.entities.player', 'plugins.local'
)
.defines(function() {
	EntitySavePoint = ig.Entity.extend({
		_wmScalable : true,
		_wmDrawBox : true,
		_wmBoxColor : "rgba(255, 0, 255, 0.5)",
		gravityFactor: 0,
		size: {x: 16, y: 16},
		offset: {x:0, y:0},
		
		collides: ig.Entity.COLLIDES.PASSIVE,
		checkAgainst: ig.Entity.TYPE.A,
		timeStop: 0,
		
		check: function (other) {
			if (typeof(other) == 'EntityPlayer') {
				ig.global.repo.save({key: 'gamestate', gamestate: JSON.stringify(ig.game)}, function(gamestate) {
					console.log("Saved!?");
					
				});
				
			}
		},
		
		update: function() {
			var player = ig.game.getEntitiesByType(EntityPlayer)[0];
			if (this.touches(player)) {
				if (ig.input.pressed('save')) {
					ig.global.repo.save({key: 'gamestate', gamestate: JSON.stringify(ig.game)}, function(gamestate) {
						console.log("Saved!?");
					});
					ig.global.repo.save({key: 'canary', canary: 5});
				}
			}
			
		},
		
		
		
		
		
	});
});