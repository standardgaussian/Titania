ig.module('game.entities.thrusterPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityThrusterPickup = EntityPickup.extend({ 
		animSheet : new ig.AnimationSheet('media/pickups/thrusterPickup.png', 16, 16),
		offset: {x:0, y:0},
		propertyValue: 'thruster',
	
	});
});