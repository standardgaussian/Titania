ig.module('game.entities.magnetBootsPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityMagnetBootsPickup = EntityPickup.extend({ 
		animSheet : new ig.AnimationSheet('media/pickups/magBootsPickup.png', 16, 16),
		offset: {x:0, y:0},
		propertyValue: 'magnetBoots',
	
	});
});