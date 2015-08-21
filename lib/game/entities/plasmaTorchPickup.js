ig.module('game.entities.plasmaTorchPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityPlasmaTorchPickup = EntityPickup.extend({ 
		animSheet : new ig.AnimationSheet('media/pickups/plasmaTorchPickup.png', 16, 16),
		offset: {x:0, y:0},
		propertyValue: 'armed',
	
	});
});