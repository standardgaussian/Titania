ig.module('game.entities.chargeShotPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityChargeShotPickup = EntityPickup.extend({ 
		animSheet : new ig.AnimationSheet('media/pickups/chargeShotPickup.png', 16, 16),
		offset: {x:0, y:0},
		propertyValue: 'chargeShot',
	
	});
});