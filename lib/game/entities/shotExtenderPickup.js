ig.module('game.entities.shotExtenderPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityShotExtenderPickup = EntityPickup.extend({ 
		animSheet : new ig.AnimationSheet('media/pickups/shotExtenderPickup.png', 16, 16),
		offset: {x:0, y:0},
		propertyValue: 'shotExtender',
	
	});
});