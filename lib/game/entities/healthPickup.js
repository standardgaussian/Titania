//increase current health

ig.module('game.entities.healthPickup')
.requires('impact.entity',
'game.entities.pickup'
)
.defines(function() {
	EntityHealthPickup = EntityPickup.extend({ 
	
		animSheet: new ig.AnimationSheet('media/pickups/healthTransient.png', 12, 12),
		healthBonus: 25,
		size: {x: 12, y:12},
		offset: {x: 0, y:1},
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
			other.gainHealth(this.healthBonus);
			this.kill();
		},
		
	});
	
});