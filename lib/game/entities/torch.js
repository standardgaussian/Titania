//player arc entity
//currently stolen wholesale from Resident Raver's "bullet" entity

//adapted to be a close-range non-moving hitscan weapon

ig.module('game.entities.torch')
.requires('impact.entity'
)
.defines(function() {
	EntityTorch = ig.Entity.extend({
		_wmIgnore :true,
		size:{x:30, y:6},
		animSheet: new ig.AnimationSheet('media/plasmaArcSheet.png', 30, 6),
		maxVel: {x:150, y:150},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,
		gravityFactor : 0,
		hitArray: new Array(),
		
		distLimit : 50,
		maxDist: 0,
		torchTime: 0.5,
		torchTimer: new ig.Timer(),
		
		origin: null,
		
		init: function(x, y, settings) {
			if (!settings.dir) {
				this.vel.x = settings.origin.vel.x;
				this.vel.y = settings.origin.vel.y;
				this.addAnim('idle', 0.1, [0,1,2]);
				this.anims.idle.flip.x = settings.flip;
				this.parent(x + (settings.flip ? -28 : 13 ), y+4, settings);

			}
			else if (settings.dir == 1) {
				this.vel.y = -this.maxVel.y;
				this.addAnim('idle',0.1,[0,1,2]);
				this.anims.idle.angle = 3*Math.PI/2;
				this.parent(x, y, settings);
			}
			else if (settings.dir == -1) {
				this.vel.y = this.maxVel.y;
				this.addAnim('idle', 0.1, [0,1,2]);
				this.anims.idle.angle= Math.PI/2;
				this.parent(x, y+14, settings);
			}
			if (!settings.origin.shotExtender) {
				this.maxDist = this.distLimit;
				this.origin = settings.origin;
				
			}
			this.origin = settings.origin;
			this.torchTimer.reset();
			
		},
		
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x || res.collision.y) {
					this.kill();
			}
		},
		//do damage to everything it touches, but only once
		check: function(other) {
			for (var i = 0; i < this.hitArray.length; i++) {
				if (this.hitArray[i] == other) {
					return;
				}
			}
			other.receiveDamage(500, this);
			this.hitArray.push(other);
		},
		update: function() {
			this.vel.x = this.origin.vel.x;
			this.vel.y = this.origin.vel.y;
			if (this.torchTimer.delta() > this.torchTime) {
				this.kill();
			}
			this.parent();
		}
		
	});
});