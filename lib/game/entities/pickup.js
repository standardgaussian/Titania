//abstract pickup module

ig.module('game.entities.pickup')
.requires('impact.entity',
'impact.game')
.defines(function() {
	EntityPickup = ig.Entity.extend({
		size: {x: 16, y : 16},
		offset: {x: 0, y:1},
		animSheet: new ig.AnimationSheet('media/pickups/generic_pickup.png', 16, 16),
		
		gravityFactor: 0,
		center: {x:0, y:0},
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,
		propertyValue: null,
		springiness: 15,
		
		
		init: function(x, y, settings) {
			this.parent(x,y,settings);
			this.center.x = this.pos.x;
			this.center.y = this.pos.y;
			this.vel.y = 25;
			
			this.addAnim('idle', 0.2, [0]);
			this.currentAnim = this.anims.idle;
			
		},
		
		update: function() {
				this.accel.y = this.springiness*(this.center.y - this.pos.y);
				
				this.parent();
		},
		
		check: function(other) {
			if (other == ig.game.getEntitiesByType(EntityPlayer)[0]) {
				this.pickup(other);
			}
		},
		
		pickup: function(other) {
			other.gainProperty(this.propertyValue.toString());
			console.log("Acquired ", this.propertyValue);
			this.kill();
		}
		
		
		
		
	});
});