//player shot entity
//currently stolen wholesale from Resident Raver's "bullet" entity
//currently only left/right for now, implement up/down later

ig.module('game.entities.chargeShot')
.requires('impact.entity'

)
.defines(function() {
	EntityChargeShot = ig.Entity.extend({
		_wmIgnore :true,
		size:{x:10, y:6},
		animSheet: new ig.AnimationSheet('media/chargebullet.png', 10, 6),
		maxVel: {x:200, y:200},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,
		gravityFactor : 0,
		
		distLimit : 50,
		maxDist: 0,
		
		origin: null,
		
		init: function(x, y, settings) {
			if (!settings.dir) {
				this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
				this.addAnim('idle', 0.2, [0]);
				this.parent(x + (settings.flip ? 0 : 11 ), y+6, settings);
			}
			else if (settings.dir == 1) {
				this.vel.y = -this.maxVel.y;
				this.addAnim('idle',0.2,[0]);
				this.anims.idle.angle = Math.PI/2;
				this.parent(x + 4, y, settings);
			}
			else if (settings.dir == -1) {
				this.vel.y = this.maxVel.y;
				this.addAnim('idle', 0.2, [0]);
				this.anims.idle.angle= 3*Math.PI/2;
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
			other.receiveDamage(15, this);
			this.kill();
		},
		
	});
});