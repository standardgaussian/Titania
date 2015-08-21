//missile entity
//all the projectiles should really be extended from a single Projectile entity

ig.module('game.entities.missile')
.requires('impact.entity'
)
.defines(function() {
	EntityMissile = ig.Entity.extend({
		_wmIgnore : true,
		animSheet: new ig.AnimationSheet('media/missile_small.png', 8, 8),
		size:{x: 8, y: 8},
		maxVel: {x: 250, y: 250},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,
		gravityFactor : 0,
		
		init: function(x, y, settings) {
			if (!settings.dir) {
				this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
				this.addAnim('idle', 0.2, [0]);
				this.anims.idle.angle = (settings.flip ? (5*Math.PI/4) : Math.PI/4);
				this.parent(x + (settings.flip ? 0 : 11 ), y+6, settings);
			}
			else if (settings.dir == 1) {
				this.vel.y = -this.maxVel.y;
				this.addAnim('idle',0.2,[0]);
				this.anims.idle.angle = -Math.PI/4;
				this.parent(x + 4, y, settings);
			}
			else if (settings.dir == -1) {
				this.vel.y = this.maxVel.y;
				this.addAnim('idle', 0.2, [0]);
				this.anims.idle.angle= 3*Math.PI/4;
				this.parent(x+4, y+14, settings);
			}
		},
		
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x || res.collision.y) {
					this.kill();
			}
		},
		
		check: function(other) {
			other.receiveDamage(30, this);
			this.kill();
		},
		
		
		
	});
});