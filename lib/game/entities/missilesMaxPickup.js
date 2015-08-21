//increase max missiles

ig.module('game.entities.missilesMaxPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityMissilesMaxPickup = EntityPickup.extend({ 
	
		animSheet: new ig.AnimationSheet('media/pickups/missile.png', 16, 16),
		missilesBonus: 5,
		
		
		pickup: function(other) {
			other.missilesUp(this.missilesBonus);
			other.fullMissiles();
			this.kill();
		},
		
	});
	
});