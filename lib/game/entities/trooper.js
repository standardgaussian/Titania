//shooting monster

ig.module('game.entities.trooper')
.requires('game.entities.physEnt', 'game.entities.enemyShot', 'game.const_defs')
.defines(function() {
	EntityTrooper = EntityPhysEnt.extend({
		animSheet: new ig.AnimationSheet('media/enemies.png', 16, 16),
		size: {x:13, y:14},
		offset: {x:1, y: 1},
		health: 30,
		flip: false,
		speed: 20,
		maxVel: {x: 20, y: 300},
		type: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,
		checkAgainst: ig.Entity.TYPE.A,
		gravityFactor: 1,
		playerRef: null,
		bounciness: 0,
		
		
		//AI settings
		
		sightDist: 300,
		sightAngle: 45,
		sawPlayerTime: 3,
		sightTimer: new ig.Timer(),
		shootDist: 200,
		shootAngle: 45,
		shotTimer: new ig.Timer(),
		shotCooldown: 3,
		
		maxDist: 0,
		minDist: 0,
		
		lastLocation: {
			pos: { x: 0, y: 0},
			size: {x: 16, y: 16}		
		},
		
		categoryBits: ig.Filter.ENEMY,
		maskBits: 0xFFFF,
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			

			
			this.sightTimer.set(-4);
			this.shotTimer.reset();
		},
		
		update: function() {
			this.playerRef = ig.game.getEntitiesByType(EntityPlayer)[0];

			if (this.playerInSight()) {
				this.combatEngage(this.playerRef);
			}
			else if (this.sightTimer.delta() < this.sawPlayerTime) {
				this.combatEngage(this.lastLocation);
			}
			else {
				this.idleAction();
			}
			this.parent();
		},
		
		playerInSight: function() {
			var res;
			if (!this.flip) {
					if (this.playerRef.pos.x > this.pos.x && Math.abs(this.angleTo(this.playerRef)) < this.sightAngle && this.distanceTo(this.playerRef) < this.sightDist) {
						res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, (this.playerRef.pos.x - this.pos.x), (this.playerRef.pos.y - this.pos.y), 1, 1);
						if (res.collision.x || res.collision.y) {
							return false;
						}
						this.sightTimer.set(0);
						this.lastLocation.pos = {x: this.playerRef.pos.x, y: this.playerRef.pos.y};
						return true;
					}
				}
			else {
				if (this.playerRef.pos.x < this.pos.x && Math.abs(this.angleTo(this.playerRef)) < this.sightAngle && this.distanceTo(this.playerRef) < this.sightDist) {
					res = ig.game.collisionMap.trace(this.pos.x, this.pos.y, (this.playerRef.pos.x - this.pos.x), (this.playerRef.pos.y - this.pos.y), 1, 1);
					if (res.collision.x || res.collision.y) {
							return false;
						}
					this.sightTimer.set(0);
					this.lastLocation.pos = {x: this.playerRef.pos.x, y: this.playerRef.pos.y};
					return true;
					}
			}
			return false;
			
		},
		
		idleAction: function() {
			//check for edges
			if (!ig.game.collisionMap.getTile(
				this.pos.x + (this.flip ? +4 : this.size.x - 4),
				this.pos.y + this.size.y +1) && this.standing
				)
				{
					this.flip = !this.flip;
				}
			
			var xdir = this.flip ? -1 : 1;
			this.body.ApplyForce(new Box2D.Common.Math.b2Vec2(this.speed*xdir, 0), this.body.GetPosition());
			this.currentAnim = this.anims.idle;
			this.currentAnim.flip.x = this.flip;
		},
		
		combatEngage: function(player) {
			//facing
			if (this.flip && player.pos.x > this.pos.x) {
				this.flip = false;
			}
			else if (!this.flip && player.pos.x < this.pos.x) {
				this.flip = true;
			}
			
			//shooting
			
			if (this.distanceTo(player) < this.shootDist && this.angleTo(player) < this.shootAngle && player instanceof EntityPlayer) {
				if (this.shotTimer.delta() > this.shotCooldown) {
					this.shotTimer.reset();
					this.fire(player);
				}
			}
			
			//approach
			
			if (this.distanceTo(player) > this.maxDist) {
				this.vel.x = this.flip ? -this.speed: this.speed;
			}
			
			//retreat
			
			if (this.distanceTo(player) < this.minDist) {
				this.vel.x = this.flip? this.speed: -this.speed;
			}
			//edge
			if (!ig.game.collisionMap.getTile(
				this.pos.x + (this.flip ? +4 : this.size.x - 4),
				this.pos.y + this.size.y +1) && this.standing
				) {
					this.vel.x = 0;
				}
				
			this.currentAnim.flip.x = this.flip;
			
			if (this.shotTimer.delta() < 1) {
				this.currentAnim = this.anims.shoot;
			}
			else {
				this.currentAnim = this.anims.idle;
			}
				
			//no jumping implemented for this guy	
			
			
		
			
		},
		
		fire: function(target) {
			var dir = 0;
			ig.game.spawnEntity(EntityEnemyShot, this.pos.x, this.pos.y, {flip: this.flip, origin: this, dir: dir, target: target});
		},
		
		handleMovementTrace: function (res) {
			this.parent(res);
			if (res.collision.x) {
				this.flip = !this.flip;
			}
			
		},
		
		check: function(other) {
			other.receiveDamage(30, this);
			ig.Entity.solveCollision(this,other);
		},
		
		//override receiveDamage to make this guy face the player when shot
		receiveDamage: function(amount, from) {
				this.parent(amount, from);
				if (from && from.pos.x < this.pos.x) {
					this.flip = true;
				}
				else {
					this.flip = false;
				}

		},
		
		setupAnimation: function() {
			this.addAnim('idle', 0.4, [4,5,6]);
			this.addAnim('shoot', 1, [7]);
			this.addAnim('jump', 1, [5]);
		},
		
		beginContact(other, contact) {
		}
		
		
		
	});
});