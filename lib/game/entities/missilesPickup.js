//increase current missiles

ig.module('game.entities.missilesPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityMissilesPickup = EntityPickup.extend({ 
	
		animSheet: new ig.AnimationSheet('media/pickups/missileTransient.png', 12, 12),
		missilesBonus: 2,
		size: {x: 12, y:12},
		gravityFactor: 0.6,
		lifetime: 5,
		fadetime: 3,
		itemTimer: new ig.Timer(),
		springiness: 0,
		
		init: function(x,y, settings) {
			this.parent(x,y,settings);
			this.vel.y = 0;
			this.itemTimer.reset();
		},
		
		update: function() {
			if (this.itemTimer.delta() > this.fadetime) {
				this.currentAnim.alpha = Math.sin(4*Math.PI*(this.itemTimer.delta()));
			}
			if (this.itemTimer.delta() > this.lifetime) {
				this.kill();
			}
			this.parent();
		},
		
		
		pickup: function(other) {
			other.gainMissiles(this.missilesBonus);
			this.kill();
		},
		
	});
	
});