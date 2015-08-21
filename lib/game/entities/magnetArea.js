//Defines an invisible entity that permits gravity reversal

ig.module('game.entities.magnetArea')
.requires('impact.game'
)
.defines(function() {
	EntityMagnetArea = ig.Entity.extend({
		_wmDrawBox : true,
		_wmBoxColor : "rgba(255, 255, 0, 0.5)",
		_wmScalable: true,
		
		
		
		
	});
	
});