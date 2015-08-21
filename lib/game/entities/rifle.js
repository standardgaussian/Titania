//plasma rifle
//standard weapon

ig.module('game.entities.rifle')
.requires('game.entities.physEnt',
	'game.entities.carbineShot'
	//'game.entities.AssaultShot',
	//'game.entities.HeavyShot'

).
defines(function() {
	EntityRifle = EntityPhysEnt.extend({
		animSheet: new ig.AnimationSheet('media/plasmaRifle.png', 20, 5),
		size: {x: 20, y:5},
		offset: {x:0, y:0},
		mode: 'carbine',
		availableModes: {carbine: true, assault: false, heavy: false},
		categoryBits: ig.Filter.NOCOLLIDE,
		maskBits: ig.Filter.NOCOLLIDE,
		
		isFixedRotation: false,
		
		shotTimer: new ig.Timer(),
		regenTimer: new ig.Timer(),
		spreadTimer: new ig.Timer(),
		
		heatMeter: 0,
		heatMax: 100,
		overheated: false,
		//per tick? per second?
		heatRegen: 10,
		heatRegenFast: 20,
		spreadMod: 0,
		
		muzzle: null,
		
		regenMin: 0.5,
		regenFast: 2.5,
		
		heatCooldown: 0.5,
		spreadCooldown: 0.5,
		
		gravityFactor: 0,
		
		
		//meter locations
		heatLoc: {x: 20, y: 460},
		heatLen: {x: 300, y: 10},
		
		
		
		modeStats: {
			carbine: {
				cooldown: 0.7,
				heatUp: 30,
				spreadUp: 4, //in degrees
				spreadCool: 4 , //in degrees
				spreadBase: 3,	//degrees
			}
		},
		
		origin: null,
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			this.origin = settings.origin;
			this.shotTimer.set(0);
			this.regenTimer.set(0);
			this.spreadTimer.set(0);
			this.heatMeter = 0;
			this.spreadMod = 0;
			//STUFF... THANGS...
			//weld this to the player char and whatnot
			
			
			
			//fake joint
			this.pos.x = this.origin.pos.x + 5;
			this.pos.y = this.origin.pos.y + 11;
			if (!ig.global.wm) {
				//make the shot exit point
				var bodyDef = new Box2D.Dynamics.b2BodyDef();
				bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
				bodyDef.position.Set(
					(this.pos.x + this.size.x + 1) * Box2D.SCALE,
					(this.pos.y + 2) * Box2D.SCALE
				);
				this.muzzle = ig.world.CreateBody(bodyDef);
				
				var shapeDef = new Box2D.Collision.Shapes.b2CircleShape();
				shapeDef.SetRadius(0.1);
				var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
				fixtureDef.shape = shapeDef;
				fixtureDef.density = 0.1;
				fixtureDef.friction = 0;
				fixtureDef.restitution = 0;
				fixtureDef.userData = {name: 'muzzle'};
				fixtureDef.isSensor = true;
				fixtureDef.filter.categoryBits = 0x0000;
				fixtureDef.filter.maskBits = 0x0000;
				this.muzzle.CreateFixture(fixtureDef);
				
				//weld the shot exit point onto the rifle
				
				var jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();
				jointDef.bodyA = this.body;
				jointDef.bodyB = this.muzzle;
				jointDef.collideConnected = false;
				jointDef.localAnchorA = this.body.GetLocalPoint(this.muzzle.GetPosition());
				jointDef.localAnchorB = this.muzzle.GetLocalPoint(this.muzzle.GetPosition()); // a lot of needless indirection to say (0,0)
				jointDef.referenceAngle = 0;
				
				ig.world.CreateJoint(jointDef);
				
				/*
				var verts = this.body.GetFixtureList().GetShape().GetVertices();
				for (var i = 0; i < verts.length; i++) {
					//vertex closest to the origin point of weapons fire
					if (verts[i].x > 0 && verts[i].y < 0) {
						this.muzzlePos = i;
						break;
					}
				}*/
			}
			
			this.zIndex = this.origin.zIndex + 1;
			ig.game.sortEntitiesDeferred();
			
			
		},
		
		update: function() {
			//dump timers on console
			//cooldowns
			if (this.heatMeter > 0 && this.regenTimer.delta() >= this.heatCooldown && this.shotTimer.delta() >= this.regenMin) {
				if (this.shotTimer.delta() >= this.regenFast) {
						this.heatMeter -= this.heatRegenFast;
				}
				else {
					this.heatMeter -= this.heatRegen;
				}
				if (this.heatMeter <0) {
					this.heatMeter = 0;
				}
				if (this.meatMeter <= 0) {
					this.overheated = false;
				}
				this.regenTimer.reset();
			}
			if (this.spreadMod > 0 && this.spreadTimer.delta() >= this.spreadCooldown) {
				this.spreadMod -= this.modeStats[this.mode].spreadCool;
				if (this.spreadMod < 0 ) {
					this.spreadMod = 0;
				}
			}
			
			if (this.heatMeter == 0) {
				this.overheated = false;
			}
			
			//fake joint, totally hacked in
			
			this.pos.x = this.origin.flip? this.origin.pos.x -1 : this.origin.pos.x + 5;
			this.pos.y = this.origin.pos.y + 8;
			if (this.origin.inCover.exposed) {
					this.pos.y -= 6;
			}
			
			
			this.body.SetAngle(this.origin.aimUtil.aimAngle());
			
			
			
		},
		
		
		handleShoot: function(xAx, yAx) {
			if (this.shotTimer.delta() < this.modeStats[this.mode].cooldown) {
				return false; //don't do anything, give a "no" return status if the source is interested
			}
			if (this.overheated) {
				return false;	//should probably differentiate between this state and cooldown state on return
			}
			switch(this.mode) {
				case 'carbine': return this.handleShootCarbine(xAx, yAx); break;
				case 'assault': return this.handleShootAssault(xAx, yAx); break;
				case 'heavy': return this.handleShootHeavy(xAx, yAx); break;
				default: console.log("Wut"); return false; break;
			}
			
		},
		
		handleShootCarbine(xAx, yAx) {
			//we need to:
				//Find aim trajectory
				//Adjust aim for spread
				//Modify spread for future shots
				//fire the projectile
				//increase heat
				//set overheated status?
				//halt heat dissipation momentarily
				
				
			var shotAngle = Math.atan2(yAx, xAx);
			/*
			var shotPos = new Box2D.Common.Math.b2Vec2(0,0);
			//get rifle muzzle with no rotation
			shotPos.x = (this.size.x/2)*Box2D.SCALE;
			shotPos.y = (this.size.y/2)*Box2D.SCALE;
			console.log(shotPos);
			//rotate by angle
			shotPos.MulTM(Box2D.Common.Math.b2Mat22.FromAngle(shotAngle));
			//get body position in world
			shotPos.Add(this.body.GetPosition());
			//scale up
			shotPos.Multiply(1/Box2D.SCALE);
			*/
			//get the shot origin
			//var shotPos = this.body.GetWorldPoint(this.body.GetFixtureList().GetShape().GetVertices()[this.muzzlePos]);
			
			//scale back to game coords
			//shotPos.Multiply(1/Box2D.SCALE);
			
			//once we find the muzzle, we can alter the shot angle
			shotAngle += (Math.random() - 0.5)*(this.modeStats.carbine.spreadBase + this.spreadMod)*(Math.PI/180);
			this.spreadMod+= this.modeStats.carbine.spreadUp;
			this.heatMeter += this.modeStats.carbine.heatUp;
			

			ig.game.spawnEntity(EntityCarbineShot, this.muzzle.GetPosition().x/Box2D.SCALE, this.muzzle.GetPosition().y/Box2D.SCALE, {flip: this.origin.flip, shotAngle: shotAngle, origin: this});
			this.shotTimer.reset();
			
			//set overheated status
			if (this.heatMeter > this.heatMax) {
				this.overheated = true;
			}
		},
		
		setupAnimation: function() {
			this.addAnim('idle', 1, [0]);
		},
		
		//dump heat meter bar on screen somewhere
		draw: function() {
			this.currentAnim.angle = this.body.GetAngle();
			this.parent();
			//outline
			ig.system.context.strokeStyle = 'rgba(255, 0,0, 1)';
			ig.system.context.fillStyle = 'rgba(0, 0, 255, 1)';
			ig.system.context.fillRect(this.heatLoc.x, this.heatLoc.y, this.heatLen.x, this.heatLen.y);
			ig.system.context.strokeRect(this.heatLoc.x, this.heatLoc.y, this.heatLen.x, this.heatLen.y); 
			//fill
			if (!this.overheated) {
				ig.system.context.fillStyle = 'rgba(255,255,0,1)';
				ig.system.context.fillRect(this.heatLoc.x, this.heatLoc.y, this.heatLen.x*(this.heatMeter/this.heatMax), this.heatLen.y);
			}
			else {
				ig.system.context.fillStyle = 'rgba(255,0,0,1)';
				ig.system.context.fillRect(this.heatLoc.x, this.heatLoc.y, this.heatLen.x*(this.heatMeter/this.heatMax), this.heatLen.y);
				if (this.heatMeter > this.heatMax) {
					ig.system.context.strokeStyle = 'rgba(0, 255, 255,1)';
					ig.system.context.beginPath();
					ig.system.context.moveTo(this.heatLoc.x + this.heatLen.x, this.heatLoc.y);
					ig.system.context.lineTo(this.heatLoc.x + this.heatLen.x, this.heatLoc.y + this.heatLen.y);
					ig.system.context.stroke();
				}
			}
			
			//invisible conditions
			if (this.origin.meleeAttack && !this.origin.meleeAttack._killed || this.origin.onLedge) {
					this.currentAnim.alpha = 0;
			}
			else {
				this.currentAnim.alpha = 1;
			}
			
			
			
		}
		
		
	});

});