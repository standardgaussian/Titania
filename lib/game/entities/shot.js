//player shot entity
//currently stolen wholesale from Resident Raver's "bullet" entity
//currently only left/right for now, implement up/down later

ig.module('game.entities.shot')
.requires('game.entities.physEnt', 'game.const_defs'
)
.defines(function() {
	EntityShot = EntityPhysEnt.extend({
		_wmIgnore :true,
		size:{x:6, y:6},
		animSheet: new ig.AnimationSheet('media/energybullet.png', 6, 6),
		maxVel: {x:200, y:200},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		gravityFactor : 0,
		isTransient: true,
		
		distLimit : 50,
		maxDist: 0,
		damage: 50,
		maskBits: ig.Filter.ENEMY + ig.Filter.ENVIRON,
		categoryBits: ig.Filter.FRIENDLY,
		
		origin: null,
		
		init: function(x, y, settings) {
			this.origin = settings.origin;
			if (!settings.vector) {
				if (!settings.dir) {
					this.parent(x + (settings.flip ? 0 : 11 ), y+4, settings);
					this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
					this.addAnim('idle', 0.2, [0]);
				}
				else if (settings.dir == 1) {
					this.parent(x + 4, y, settings);
					this.vel.y = -this.maxVel.y;
					this.addAnim('idle',0.2,[0]);
					this.anims.idle.angle = Math.PI/2;
				}
				else if (settings.dir == -1) {
					this.parent(x+4, y+14, settings);
					this.vel.y = this.maxVel.y;
					this.addAnim('idle', 0.2, [0]);
					this.anims.idle.angle= 3*Math.PI/2;
				}
				if (!settings.origin.shotExtender) {
					this.maxDist = this.distLimit;
					this.origin = settings.origin;
				
				}
			}
			else {
				this.parent(x,y,settings);
				this.vel.x = settings.vector.x;
				this.vel.y = settings.vector.y;
			}
			this.addAnim('idle', 0.2, [0]);
			
		},
		
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x || res.collision.y) {
					this.kill();
			}
		},
		
		check: function(other) {
			//other.receiveDamage(this.damage, this);
			//this.kill();
		},
		//kind of hacky, just checks distance to player, might be good enough, might be broken
		update: function() {
			if (this.maxDist != 0) {
				if (this.distanceTo(this.origin) > this.maxDist) {
					this.kill();
				}
			}
			
			this.parent();
		},
		
		beginContact(other, contact) {
			this.parent();
			//make sure this entity is not dead before applying this damage...though it most likely doesn't matter
			if (other && other.receiveDamage && !this._killed) {
				other.receiveDamage(this.damage, this);
			}
			this.kill();
			//fairly redundant after getting killed, but leave it in
			//this.parent(other, contact);
		}
		

		
	});
});