//Eyeball

ig.module('game.entities.eyeball')
.requires('impact.entity')
.defines( function() {
	EntityEyeball = ig.Entity.extend({ 
		animSheet: new ig.AnimationSheet ('media/enemies.png', 16, 16),
		size: {x: 0, y:0},
		offset: {x : 1, y : 3},
		size: {x: 14 ,y: 10},
		flip: false,
		friction: {x: 140, y: 0},
		speed: 0,
		type: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,
		checkAgainst: ig.Entity.TYPE.A,
		gravityFactor: 0,
		playerRef: null,
		
		center: {x:0, y:0},
		
		init: function(x, y, settings) {
			this.parent(x,y,settings);
			this.center.x = this.pos.x;
			this.center.y = this.pos.y;
			this.addAnim("hover", 0.4, [8,9,10]);
			this.vel.y = 5;
		},
		
		update: function() {
			this.playerRef = ig.game.getEntitiesByType(EntityPlayer)[0];
			this.accel.y = 5*(this.center.y - this.pos.y);
			if (this.playerRef.pos.x < this.pos.x) {
				this.flip = true;
			}
			else {
				this.flip = false;
			}
			this.currentAnim.flip.x = this.flip;
			
			this.parent();
		},
		
		check: function(other) {
			other.receiveDamage(5, this);
		}
		
	});
});