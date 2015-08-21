ig.module('game.entities.blinkPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityBlinkPickup = EntityPickup.extend({ 
		animSheet : new ig.AnimationSheet('media/pickups/blinkPickup.png', 16, 16),
		offset: {x:0, y:0},
		propertyValue: 'blink',
	
	});
});