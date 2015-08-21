//increase max health

ig.module('game.entities.healthMaxPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityHealthMaxPickup = EntityPickup.extend({ 
	
		animSheet: new ig.AnimationSheet('media/pickups/healthMaxPickup.png', 16, 16),
		healthBonus: 50,
		offset: {x:1, y:0},
		
		
		pickup: function(other) {
			other.healthUp(this.healthBonus);
			other.fullHealth();
			this.kill();
		},
		
	});
	
});