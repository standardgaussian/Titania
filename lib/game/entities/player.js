//Player entity for TheLoop

ig.module('game.entities.player')
.requires('game.entities.physEnt',
	'impact.timer',
	'game.entities.shot',
	'game.entities.chargeShot',
	'game.entities.EnergyShield',
	'game.entities.missile',
	'impact.sound',
	'game.entities.torch',
	'game.entities.rifle',
	'game.aiming',
	'game.const_defs',
	'game.entities.melee',
	'plugins.tileUtil',
	'plugins.tween',
	'plugins.machina.stateMachineDefs'

)
.defines(function() {
	EntityPlayer = EntityPhysEnt.extend({
		//basic animation properties
		//animSheet : new ig.AnimationSheet('media/Hero.png', 16, 16),
		animSheet: new ig.AnimationSheet('media/SpaceWidesheet.png', 22, 22),
		size: {x:20, y:22},
		offset: {x:0, y:0},
		flip: false,
		vertFlip: false,
		isFixedRotation: true,
		_debugD: false,
		
		//permutations on size data
		
		dimensions: { 
			crouch : { size: {x:21, y:16}, offset: {x:0, y: 6}, maxVel: {x: 35, y: 300}, categoryBits: ig.Filter.PC, maskBits: ig.Filter.ALL  },
			normal: {size: {x:20, y:22}, offset: {x: 0, y:0}, maxVel: {x: 50, y: 300}, categoryBits: ig.Filter.PC, maskBits: ig.Filter.ALL  },
			roll: {size: {x:18, y: 14}, offset: {x: 2, y:8}, maxVel: {x: 125, y: 300}, categoryBits: ig.Filter.FRIENDLY, maskBits: ig.Filter.ENVIRON },
			ledgeGrab: {size: {x: 17, y: 22}, offset: {x:3, y: 0}, maxVel: {x: 50, y: 300}, categoryBits: ig.Filter.PC, maskBits: ig.Filter.ALL},
			melee: {size: {x: 16, y: 22}, offset: {x: 0, y:0}, maxVel: {x:50, y:300}, categoryBits: ig.Filter.PC, maskBits: ig.Filter.ALL},
			inCover: {size: {x:18, y: 16}, offset: {x:4, y:6}, maxVel:{x:0, y:0}, categoryBits: ig.Filter.PC, maskBits: ig.Filter.ALL},
			exposed: {size: {x:15, y: 22}, offset: {x:1, y:0}, maxVel: {x:0, y:0},  categoryBits: ig.Filter.PC, maskBits: ig.Filter.ALL},
		},
		
		senses: {
			rightDetect: {size: {x: 4, y: 11}, pos: {x: 12.5, y: -5.5}, categoryBits: ig.Filter.SENSOR, maskBits: ig.Filter.ENVIRON, fixture: null, state: false, grabTile: null},  
			leftDetect: {size: {x: 4, y:11}, pos: {x: -12.5, y: -5.5}, categoryBits: ig.Filter.SENSOR, maskBits: ig.Filter.ENVIRON, fixture: null, state: false, grabTile: null},
			rightLedgeDetect: {size: {x: 25, y: 2}, pos: { x:2, y: -12}, categoryBits: ig.Filter.SENSOR, maskBits: ig.Filter.ENVIRON, fixture: null, state: false},
			leftLedgeDetect: {size: {x: 25, y: 2}, pos: {x: -2, y: -12}, categoryBits: ig.Filter.SENSOR, maskBits: ig.Filter.ENVIRON, fixture: null, state: false}, //do I even need this?
			downDetect: { size: {x: 19, y: 8}, pos: {x: 0, y: 11}, categoryBits: ig.Filter.SENSOR, maskBits: ig.Filter.ENVIRON, fixture: null, state: false},
		},
		
		currentDim: 'normal',
		
		aimUtil: new ig.Aiming(this),
		moveMag: 0.6,
		idleMag: 0.25,
		
		
		//basic physics properties
		maxVel: {x: 50, y:300},
		//hacky, belongs in dimensions
		maxVelRun: {x: 100, y:300},
		maxVelWalk: {x: 50, y: 300},
		
		friction: {x:0.5, y:0.5},
		uniFriction: 0.5,
		accelGround: 100,
		accelGroundRun: 150, 
		accelAir: 50,
		jumpAcc: 300,
		jumpStart: 40,
		jumpTime: 0.3,
		
		slowDownAccel: 40,
		
		isCrouched: false, 
		
		thrusterVel: 100,
		
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		//jump Handler
		isJumping: false,
		jumpTimer : new ig.Timer(),
		usedThruster : false,
		
		//shoot handler
		shootTimer: new ig.Timer(),
		shotCooldown: 0.7,
		isShooting: false,
		shotCharging: false,
		chargeTimer: new ig.Timer(),
		chargeTime: 1.5,
		chargeImpulse : 90,
		
		//ability list
		
		shotExtender: true,
		thruster: false,
		missilesMax: 0,
		blink : false,
		chargeShot: false,
		magnetBoots: false,
		armed: true,
		
		//weapon objects
		rifle: null,
		meleeAttack: null,
		
		//Blink + Charged Shot = AOE burst effect
		//May not necessarily trace
		
		//blink handler
		blinkTimer: new ig.Timer(),
		blinkDist: 45,
		blinkDenySFX: new ig.Sound('media/sounds/nope.*'),
		
		//magnet handler
		
		gravityFactor: 1,
		magnetEngaged: false,
		magnetTimer: new ig.Timer(),
		magnetOff: 2,
		
		//missile handler
		
		currentMissiles: 0,
		
		//status
		
		health: 10000,
		healthMax: 10000,
		
		//hit invincibility
		
		mercyTimer: new ig.Timer(),
		mercyTime: 1, //short
		invincible: false,
		
		//knockback
		isKnocked: false,
		knockedTimer: new ig.Timer(),
		knockedTime: 0.5,
		recoilTime: 0.3,
		knockVector: 0,
		
		//energy shield attributes
		//stored when shield is not active, recovered when activating shield
		haveShield: true,	//just kluge it to true for now
		shieldStrength: 100,
		shieldObj: null,
		shieldJoint: null,
		
		
		
		//filter data
		categoryBits: ig.Filter.PC,
		maskBits: 0xFFFF,
		
		
		//sigh
		//even more state info that should be refactored!!! v_v
		isRolling: false,
		rollTimer: new ig.Timer(),
		rollTime: 0.7, //how long until the player regains direct control. Directional Influence if rolling into the air is a possibility
		velStore: 0,
		
		onLedge: false,
		ledgeTimer: new ig.Timer(), //used to prevent infinite ledge grab. Could use a flag in ledge detection instead... probably SHOULD use a flag in ledge detection. 
		ledgeResetTime: 0.1,	//Doesn't matter, can still infinite ledge grab. Timer is too short, but making it much longer would cause an otherwise nearby valid ledge grab to fail.
								//Implement sensor-based solution in refactor.
								
		inCover: {left: false, right: false, oldDim: {x:0, y:0}, exposed: false},
		
		raycastState: 0,
		
		//machina
		stateMachine: null, 
		
		
		init: function(x,y, settings) {
			this.parent(x,y,settings);
			
			this.currentDim = 'normal';
			if (!ig.global.wm) {
				this.makeDim('crouch', this.dimensions.crouch.size);
				this.makeDim('roll', this.dimensions.roll.size, {categoryBits: this.dimensions.roll.categoryBits, maskBits: this.dimensions.roll.maskBits});
				this.makeDim('ledgeGrab', this.dimensions.ledgeGrab.size);
				this.makeDim('melee', this.dimensions.melee.size, {categoryBits: this.dimensions.melee.categoryBits, maskBits: this.dimensions.melee.maskBits});
				this.makeDim('inCover', this.dimensions.inCover.size, {categoryBits: this.dimensions.inCover.categoryBits, maskBits: this.dimensions.inCover.maskBits});
				this.makeDim('exposed', this.dimensions.exposed.size, {categoryBits: this.dimensions.exposed.categoryBits, maskBits: this.dimensions.exposed.maskBits});
				//senses
				this.setupSenses();
			}

			this.knockedTimer.set(-5);
			if (!ig.global.wm) {
				this.rifle = ig.game.spawnEntity(EntityRifle,this.pos.x + 5, this.pos.y + 11, {flip: this.flip, origin: this});
			}
		
			this.stateMachine = ig.machinaJS.Create(ig.Machines.getDef("testMachine"));
			console.log(this.stateMachine);
			
			
		},
		
		setupSenses: function() {
			for (sense in this.senses) {
				this.makeSense(sense, this.senses[sense]);
			}
		},
		
		setupAnimation: function() {

				/*this.addAnim('idle', 2.5, [13, 6], true);
				this.addAnim('run', 0.1, [13, 14,15, 12]);
				this.addAnim('jump', 1, [14]);
				this.addAnim('shoot', 1, [19]);
				this.addAnim('hurt', 1, [14]);*/
				
				this.addAnim('idle', 0.4, [0,1]);
				this.addAnim('run', 0.15, [0,1]);
				this.addAnim('jump', 1, [1]);
				this.addAnim('shoot',1, [0]);
				this.addAnim('hurt', 1, [0]);
				this.addAnim('crouch', 1, [2]);
				this.addAnim('roll', 0.5, [3]);
				this.addAnim('ledgeGrab', 1, [4]);
				this.addAnim('melee', 0.5, [5]);
				this.addAnim('inCover', 0.5,[6]);
				this.addAnim('exposed', 0.5, [7]);

		},
		
		dumpDat : true,
		update: function() {
			
			if(ig.input.pressed('jump')) {
				this.stateMachine.anything();
			}
			
			else if (ig.input.analogAxes[0] > this.idleMag) {
				this.stateMachine.walking();
			}
			
			if (!this.dumpDat) {
				this._dumpFixtureData();
				this.dumpDat = true;
			}
			
			if (this.detectSqueeze()) {
				this.forceCrouch();
			}
			
			
			if (this.standing) {
				this.usedThruster = false;
			}
			else if (this.ledgeGrabDetect() && !this.onLedge) {	//you ALSO need downDetect to check if there's nothing under you...
				this.ledgeGrab();
			}
			
			if (this.inCover.left == true) {
				if (ig.input.released('crouch')) {
					this.unCover();
				}
				else if (ig.input.analogAxes[2] < -this.moveMag) {
					this.expose();
				}
				else if (ig.input.analogAxes[2] > -this.idleMag && this.inCover.exposed) {
					this.unExpose();
				}
				//exposed aiming
				if (this.inCover.exposed) {
					this.aimUtil.update(ig.input.analogAxes[0], ig.input.analogAxes[1], ig.input.analogAxes[2], ig.input.analogAxes[3]);
					if (ig.input.pressed('shoot')) {
						this.handleShoot();
					}
				}
				if (ig.input.pressed('roll')) {
					
					if (ig.input.analogAxes[0] <= -this.idleMag) {
						//console.log("COVER VAULT");
						this.unCover();
						//totally hacked together sequence
						this.pos.x -= 6;
						this.pos.y -= 17;
						this.handleRollStart();
					}
				}
				
			}
			else if (this.inCover.right == true) {
				if (ig.input.released('crouch')) {
					this.unCover();
				}
				else if (ig.input.analogAxes[2] > this.moveMag) {
					this.expose();
				}
				else if (ig.input.analogAxes[2] < this.idleMag && this.inCover.exposed) {
					this.unExpose();
				}
				//exposed aiming
				if (this.inCover.exposed) {
					this.aimUtil.update(ig.input.analogAxes[0], ig.input.analogAxes[1], ig.input.analogAxes[2], ig.input.analogAxes[3]);
					if (ig.input.pressed('shoot')) {
						this.handleShoot();
					}
				}
				
				if (ig.input.pressed('roll')) {
					
					if (ig.input.analogAxes[0] >= this.idleMag) {
						//console.log("COVER VAULT");
						this.unCover();
						//totally hacked together sequence
						this.pos.x += 6;
						this.pos.y -= 15;
						this.handleRollStart();
					}
				}
				
				
			}
			
			else if (this.onLedge) {
				//silly, belongs in handleInputs
				this.handleLedgeInputs();
			}
			
			
			
			else if (this.isRolling) {
				this.handleRolling();
			}
			
			else if (this.meleeAttack && !this.meleeAttack._killed) {
				 //don't do anything, we're in the middle of something
			}
			
			else {
				
				this.handleInputs();
			}
			
			//cover
			//left = 1
			//right = 2
			//not even enumming this
			
			
			this.handleAnimations();
			
			if (this.mercyTimer.delta() > this.mercyTime) {
				this.invincible = false;
				this.currentAnim.alpha = 1;
			}
			
			//knocked back
			if (this.isKnocked && this.knockedTimer.delta() < this.knockedTime) {
				this.vel.x = Math.cos(this.knockVector)*100*(this.knockedTime - this.knockedTimer.delta());
				this.vel.y = Math.sin(this.knockVector)*100*(this.knockedTime - this.knockedTimer.delta());
				
			}
			else {
				this.isKnocked = false;
			}
			
			this.parent();
		},
		
		detectSqueeze: function() {
			var contacts = this.body.GetContactList();
			if (!contacts) return false;
			var tug =  {up: false, down: false};
			do {
				var cont = contacts.contact;
				if (cont.GetManifold().m_pointCount == 0) continue;
				var normRaw = cont.GetManifold().m_localPlaneNormal;
				var norm = null;
				if (cont.GetFixtureA().GetBody().entity != this) {
					norm = normRaw.Copy();
					norm.NegativeSelf();
				}
				else {
					norm = normRaw;
				}
				
				if (norm.x == 0) {
					if (norm.y > 0) {
						tug.up = true;
						//console.log("Tug up");
					}
					else if (norm.y < 0) {
						//console.log("Tug down");
						tug.down = true;
					}
				}
				
				
			} while (contacts = contacts.next);
			if (tug.up && tug.down) {
				//console.log("SQUEEZE");
				return true;
			}
			//console.log("NO SQUEEZE");
			return false;
		},
		
		forceCrouch: function() {
			//console.log("FORCING CROUCH");
			this.crouch();
		},
		
		handleLedgeInputs: function() {
			//you're hanging on a ledge... what now?
			
			if (ig.input.analogAxes[1] <= -this.moveMag) {
				this.climbLedge();
			}
			else if (ig.input.pressed('roll')) {
				this.rollOnLedge();
			}
			else if (ig.input.analogAxes[1] >= this.moveMag) {
				this.dropFromLedge();
			}
			else if (ig.input.pressed('jump')) {
				this.jumpOffLedge();
			}
			else {
				return;
			}
			this.senses.rightDetect.grabTile = null;
			this.senses.leftDetect.grabTile = null;
			this.ledgeTimer.reset();
			
			
		},
		//without tweening, just change the dim and then slide the char up <_<
		//conditional can be skipped in favor of trinary expressions
		climbLedge: function() {
			
			if (this.flip) {
				var tilePos = tileUtil.pxToTile(this.senses.leftDetect.grabTile.x, this.senses.leftDetect.grabTile.y);
				tilePos.tY -= 1;
				if (ig.game.collisionMap.getTile(tileUtil.tileToPx(tilePos.tX, tilePos.tY))) {
					return;
				}
				this.onLedge = false;
				this.dimChange('normal');
				this.pos.y -= this.size.y - 9;
				this.gravityFactor = 1;
				this.pos.x -= 4;
			}
			
			else {
				//check if there is room for us!
				//this actually doesn't work <_<
				var tilePos = tileUtil.pxToTile(this.senses.rightDetect.grabTile.x, this.senses.rightDetect.grabTile.y);
				tilePos.tY -= 1;
				if (ig.game.collisionMap.getTile(tileUtil.tileToPx(tilePos.tX, tilePos.tY))) {
					return;
				}
				this.onLedge = false;
				this.dimChange('normal');
				this.pos.y -= this.size.y - 9;
				this.gravityFactor = 1;
				this.pos.x += 4;
				
			}
		},
		//can "hack" this together by first doing a regular climb up and then immediately triggering a roll
		rollOnLedge: function() {
			this.climbLedge();
			this.handleRollStart(); //done? Really?
		},
		
		dropFromLedge: function() {
			this.onLedge = false;
			this.dimChange('normal');
			this.pos.x += this. flip ?  2 : -2 ;
			this.gravityFactor = 1; //just let the game take care of itself from here?
				
		},
		
		jumpOffLedge: function() {
			this.dropFromLedge();
			//followed immediately by:
			//jumping off a ledge implies jumping in the other direction
			this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(this.flip ? (this.jumpStart/2) : (-this.jumpStart/2), -this.jumpStart), this.body.GetPosition());
			this.flip = !this.flip;
			this.isJumping = true;
		},
		
		handleInputs: function() {
			var accel = this.standing ? this.accelGround : this.accelAir;
			
			//first of all, if the shield is not active, drop it
			if (!ig.input.state('shield')) {
				if (this.shieldObj != null) {
					//ig.world.DestroyJoint(this.shieldJoint);
					this.shieldObj.kill();
					this.shieldObj = null;
					this.shieldJoint = null;
				}
			}
			var cov = this.checkCover();
			if (ig.input.analogAxes[0] >= this.moveMag && (cov & 2) && this.isCrouched) {
				this.takeCover(2);
				
			}
			else if (ig.input.analogAxes[0] <= -this.moveMag && (cov & 1) && this.isCrouched) {
				this.takeCover(1);
			}
			
			if (ig.input.pressed('roll')) {
				this.handleRollStart();
				return;
			}
			
			this.aimUtil.update(ig.input.analogAxes[0], ig.input.analogAxes[1], ig.input.analogAxes[2], ig.input.analogAxes[3]);
			if(this.aimUtil.aimVector.x < 0) {
				this.flip = true;
			}
			else {
				this.flip = false;
			}
			
			////console.log(ig.input.analogAxes[3]);
			
			//check if we are in the 'run' state 
			//kind of buggy, since we can snap back to the max walk speed by just letting go of 'run'
			//need logic that limits the max attainable speed while walking, but allows momentum to work if you're already going faster than that
			//transitioning from running to walking needs major changes
			if (ig.input.state('run')) {
				//adjust the acceleration and max velocity
				accel = this.standing? this.accelGroundRun: this.accelAir;
				this.maxVel = this.maxVelRun;
			}
			else {
				this.maxVel = this.maxVelWalk;
			}
			
			
			if (ig.input.analogAxes[0] <= -this.moveMag) {
				this.body.ApplyForce(new Box2D.Common.Math.b2Vec2(-accel, 0), this.body.GetPosition());
			}
			else if (ig.input.analogAxes[0] >= this.moveMag) {
				this.body.ApplyForce(new Box2D.Common.Math.b2Vec2(accel, 0), this.body.GetPosition());
			}
			
			//still seems to stop too quickly, might need to change the threshold level
			
			else if (this.standing)	{
				if (this.flip ? this.vel.x >= -this.maxVelWalk.x : this.vel.x <= this.maxVelWalk.x) {
					this.vel.x = 0;
				}
				else {
					this.body.ApplyForce(new Box2D.Common.Math.b2Vec2(this.flip ? this.slowDownAccel : -this.slowDownAccel, 0), this.body.GetPosition());
				}
			}
			
			if ((ig.input.state('crouch') && this.standing) || this.detectSqueeze() ) {
				this.crouch();
			}
			
			else if (!this.detectSqueeze()){
				this.unCrouch();
			}
			
			if (ig.input.pressed('jump')) {
				this.handleJump();
			}
			
			if(ig.input.released('jump')) {
				//still accelerating upwards
				if (this.vel.y < 0) {
					this.vel.y = 0;	//arrest the jump
				}
			}
			
			else {
				this.isJumping = false;
				this.accel.y = 0;
			}
			//shield takes priority
			if (ig.input.state('shield')) {
				if (this.haveShield) {
					this.handleShield();
				}
			}
			
			else if (ig.input.pressed('shoot')) {
				this.handleShoot();
			}
			
			
			else if (ig.input.pressed('melee')) {
				this.handleMelee();
			}
			
			
			if (ig.input.pressed('blink')) {
				if (this.blink) {
					this.handleBlink();
				}
			}
			
			if (ig.input.pressed('magnetize')) {
				if (this.magnetBoots) {
					if (!this.magnetEngaged) {
						this.magnetEngaged = true;
						this.magnetTimer.reset();
					}
					else {
						this.magnetEngaged = false;
						this.gravityFactor = 1;
					}
					
				}
			}
			if (this.magnetEngaged) {
				this.handleMagnetize();
				if (this.magnetTimer.delta() >= this.magnetOff) {
					this.magnetEngaged = false;
				}
			}
		},
		
		handleMelee: function() {
			this.dimChange('melee');
			this.meleeAttack = ig.game.spawnEntity(EntityMelee, this.flip ? this.pos.x - 5 : this.pos.x + 17, this.pos.y + 6, {origin: this, flip: this.flip});
			var jointDef = new Box2D.Dynamics.Joints.b2WeldJointDef();
			jointDef.bodyA = this.body;
			jointDef.bodyB = this.meleeAttack.body;
			jointDef.collideConnected = false;
			jointDef.localAnchorA = this.body.GetLocalPoint(this.meleeAttack.body.GetPosition());
			jointDef.localAnchorB = this.meleeAttack.body.GetLocalPoint(this.meleeAttack.body.GetPosition()); // a lot of needless indirection to say (0,0)
			jointDef.referenceAngle = 0;
				
			ig.world.CreateJoint(jointDef);
			
			this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(this.flip? -this.meleeAttack.meleePushImpulse: this.meleeAttack.meleePushImpulse, 0), this.body.GetPosition());
			
		},
		
		handleShield: function() {
			if (this.shieldObj) {
				return; //the shield is up, don't do anything
			}
			//make the shield object, attach it to this body
			else {
				//find the coords for the shield. For now, just make it hover in front of the player
				var shieldX = this.flip ? this.pos.x -1 : this.pos.x + 22;
				var shieldY = this.pos.y -3; //shield is 3 pixels higher than character
				this.shieldObj = ig.game.spawnEntity(EntityEnergyShield,shieldX, shieldY, {flip: this.flip, origin: this});
				if (this.shieldObj.body) {
					//make a distance joint
					//var distanceJointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();
					//distanceJointDef.Initialize(this.body, this.shieldObj.body, new Box2D.Common.Math.b2Vec2(0,0), new Box2D.Common.Math.b2Vec2(0,0));
					//this.shieldJoint = ig.world.CreateJoint(distanceJointDef);
				}
			}
		},
		//super in need of a refactor
		handleAnimations:function() {
			if (this.onLedge) {
				this.currentAnim = this.anims.ledgeGrab;
			}
			
			else if (this.inCover.left || this.inCover.right) {
				if (this.inCover.exposed) {
					this.currentAnim = this.anims.exposed;
				}
				else {
					this.currentAnim = this.anims.inCover;
				}
			}	
			
			else if (this.meleeAttack && !this.meleeAttack._killed) {
				this.currentAnim = this.anims.melee;
			}
			
			else if (this.isRolling) {
				this.currentAnim = this.anims.roll;
				this.anims.roll.angle = Math.PI;
			}
			
			else if (this.vel.y < 0) {
				this.currentAnim = this.anims.jump;
			}
			
			else if (this.isCrouched) {
				this.currentAnim = this.anims.crouch;
			}
			
			else if (this.vel.x != 0 && !this.isKnocked) {
				this.currentAnim = this.anims.run;
				
			}
			
			else if (this.isKnocked) {
				this.currentAnim = this.anims.hurt;
			}
			
			else {
				this.currentAnim = this.anims.idle;
			}
			this.currentAnim.flip.x = this.flip;
			
			if (this.gravityFactor < 0 ) {
				this.currentAnim.flip.y = true;
			}
			else {
				this.currentAnim.flip.y = false;
			}
			
			//reset idling
			
			if (this.currentAnim != this.anims.idle) {
				this.anims.idle.rewind();
			}
		},
		
		draw: function() {
			if(this.invincible)
						this.currentAnim.alpha = Math.sin(4*Math.PI*(this.mercyTime + this.mercyTimer.delta()));
			
			if (this.isRolling) {
				if (this.vel.x > 0) 
					this.currentAnim.angle = 2*Math.PI*(this.rollTimer.delta()/this.rollTime);
				else
					this.currentAnim.angle = -2*Math.PI*(this.rollTimer.delta()/this.rollTime);
				this.currentAnim.pivot.x = this.dimensions.roll.offset.x + (this.dimensions.roll.size.x/2);
				this.currentAnim.pivot.y = this.dimensions.roll.offset.y + (this.dimensions.roll.size.y/2);
			}
			this.parent();
			//aiming reticule
			if (!ig.global.wm) {
				this.drawCrosshair();
			}
		},
		
		//local vars until we get it down, then refactor up
		drawCrosshair: function() {
			var maxLen = 300;
			var minLen = 75;
			var aX = this.aimUtil.aimVector.x;
			var aY = this.aimUtil.aimVector.y;
			var angle = Math.atan2(aY, aX);
			var distSq =  maxLen;
			
			var halfLen = 2.5;
			var ctx = ig.system.context;
			ctx.strokeStyle = 'rgba(255,255,255, 1)';
			ctx.beginPath();
			ctx.moveTo(ig.system.getDrawPos(this.rifle.body.GetPosition().x/Box2D.SCALE - ig.game.screen.x) + distSq*Math.cos(angle)-halfLen, 
				ig.system.getDrawPos(this.rifle.body.GetPosition().y/Box2D.SCALE - ig.game.screen.y) + distSq*Math.sin(angle));
			ctx.lineTo(ig.system.getDrawPos(this.rifle.body.GetPosition().x/Box2D.SCALE - ig.game.screen.x) + distSq*Math.cos(angle)+halfLen,
				ig.system.getDrawPos(this.rifle.body.GetPosition().y/Box2D.SCALE - ig.game.screen.y) + distSq*Math.sin(angle));
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(ig.system.getDrawPos(this.rifle.body.GetPosition().x/Box2D.SCALE - ig.game.screen.x) + distSq*Math.cos(angle), 
				ig.system.getDrawPos(this.rifle.body.GetPosition().y/Box2D.SCALE - ig.game.screen.y) + distSq*Math.sin(angle) - halfLen);
			ctx.lineTo(ig.system.getDrawPos(this.rifle.body.GetPosition().x/Box2D.SCALE - ig.game.screen.x) + distSq*Math.cos(angle), 
				ig.system.getDrawPos(this.rifle.body.GetPosition().y/Box2D.SCALE - ig.game.screen.y) + distSq*Math.sin(angle) + halfLen);
			ctx.stroke();
		},
		
		handleJump: function() {
			
			//regular jump
			if (this.standing) {
				this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(0, -this.jumpStart), this.body.GetPosition());
				this.isJumping = true;
			}
			
			else if (this.thruster == true && this.usedThruster == false) {
				this.usedThruster = true;
				this.body.ApplyForce(new Box2D.Common.Math.b2Vec2(0, -this.thrusterVel), this.body.GetPosition());
			}
		},
		
		handleShoot: function() {
			if (!this.armed) {
				return;
			}
			/*if (this.shootTimer.delta() >= this.shotCooldown) {
				this.shootTimer.reset();
				var dir = 0;
				if (ig.input.state('up')) dir = 1;
				else if (ig.input.state('down') && !this.standing) dir = -1;
				ig.game.spawnEntity(EntityShot, this.pos.x, this.pos.y, {flip: this.flip, origin: this, dir: dir});
				this.anims.idle.rewind();
			}
			this.shotCharging = true;
			this.chargeTimer.reset();*/
			
			
			this.rifle.handleShoot(this.aimUtil.aimVector.x, this.aimUtil.aimVector.y);
			
		},
		
		handleChargeShot: function() {
			var dir = 0;
			if (ig.input.state('up')) dir = 1;
			else if (ig.input.state('down') && !this.standing) dir = -1;
			ig.game.spawnEntity(EntityChargeShot, this.pos.x, this.pos.y, {flip: this.flip, dir:dir});
			this.anims.idle.rewind();
			if (!dir && !this.standing) {
				this.vel.x += this.chargeImpulse*(this.flip ? 1 : -1);
			}
			else if (!this.standing) {
				this.vel.y += this.chargeImpulse*dir;
			}
		},
		
		handleBlink: function() {
			//first, check if the location for the blink is available
			//if not, indicate no blink. If yes, warp to it.
			//trace is if it passes through the interim location
			//direct tile check otherwise.
			var dir = this.flip ? -1 : 1;
			if (!ig.game.collisionMap.getTile(this.pos.x  + dir*this.blinkDist, this.pos.y)) {
					this.pos.x = this.pos.x + dir*this.blinkDist;
			}
			else {
				this.blinkDenySFX.play();
			}
		},
		
		handleMagnetize: function() {
			//this is probably the most computationally intense way of doing this
			//can refactor later
			
			//for now, get all instances of MagnetArea entities
			var magnetAreas = ig.game.getEntitiesByType(EntityMagnetArea);
			for (var i = 0; i < magnetAreas.length; i++) {
				if (this.touches(magnetAreas[i])) {
					this.magnetTimer.reset();
					this.gravityFactor = -1;
					return;
				}
			}
			this.gravityFactor = 1;
		},
		
		handleMissileFire: function() {
			//same cooldown as regular fire
			if (this.shootTimer.delta() >= this.shotCooldown) {
				this.currentMissiles--;
				this.shootTimer.reset();
				var dir = 0;
				if (ig.input.state('up')) dir = 1;
				else if (ig.input.state('down') && !this.standing) dir = -1;
				ig.game.spawnEntity(EntityMissile, this.pos.x, this.pos.y, {flip: this.flip, origin: this, dir: dir});
				this.anims.idle.rewind();
			}
			
		},
		
		gainProperty: function(valueName) {
			if (valueName) {
				Object.defineProperty(this, valueName, {value :true});
				}
		},
		
		healthUp: function(amount) {
			this.healthMax += amount;
		},
		
		fullHealth: function() {
			this.health = this.healthMax;
		},
		
		missilesUp: function(amount) {
			this.missilesMax += amount;
		},
		
		fullMissiles: function() {
			this.currentMissiles = this.missilesMax;
		},
		
		gainHealth: function (amount) {
			this.health += amount;
			if (this.health > this.healthMax) {
				this.health = this.healthMax;
			}
		},
		
		gainMissiles: function(amount) {
			this.currentMissiles += amount;
			if (this.currentMissiles > this.missilesMax) {
				this.currentMissiles = this.missilesMax;
			}
		},
		
		receiveDamage: function(amount, other) {
			if (this.invincible) return;
			this.parent(amount, other);
			if (this.onLedge) {
				this.dropFromLedge();	//oww
			}
			this.makeInvincible();
			this.knockback(other);
		},
		
		makeInvincible: function() {
			this.invincible = true;
			this.mercyTimer.set();
		},
		
		knockback: function(other) {
			this.isKnocked = true;
			this.knockedTimer.set();
			this.knockVector = this.angleTo(other) + Math.PI;
		},
		
		crouch: function() {
			//move the character down
			if (!this.isCrouched) {
				var oldDim = this.currentDim;
				this.body.SetAwake(false); //put the body to sleep
				this.dimChange('crouch');	//surgery
				this.isCrouched = true;
				//this.pos.y +=  this.dimensions[oldDim].size.y - this.dimensions.crouch.size.y;	//I think this is right...
				this.pos.y += 3;
				this.body.SetAwake(true); //wake up
				//console.log("crouching");
			}
			
		},
		
		unCrouch: function() {
			if (this.isCrouched) {
				var oldDim = this.currentDim;
				//this.pos.y -= 6;
				this.body.SetAwake(false); //put the body to sleep
				this.dimChange('normal');
				this.isCrouched = false;
				//this.pos.y += this.dimensions[oldDim].size.y - this.dimensions.normal.size.y;
				this.pos.y -= 3;
				this.body.SetAwake(true);
				//console.log("uncrouching");
				
			}
		},
		
		handleRollStart: function() {
			this.isRolling = true;
			this.rollTimer.set(0);
			this.dimChange('roll');
			if (ig.input.analogAxes[0] <= -this.idleMag) {
				this.vel.x = -this.dimensions.roll.maxVel.x;
			}
			else if (ig.input.analogAxes[0] >= this.idleMag) {
				this.vel.x = this.dimensions.roll.maxVel.x;
			}
			else {
				this.vel.x = this.flip ? -this.dimensions.roll.maxVel.x : this.dimensions.roll.maxVel.x;
			}
			this.pos.y +=4;
			this.body.SetAwake(true);
			this.velStore = this.vel.x;
			//console.log(this.vel.x);
			
			
		},
		
		handleRollEnd: function() {
			this.isRolling = false;
			this.dimChange('normal');
			this.pos.y -= 4;
			this.body.SetAwake(true);
			this.anims.roll.angle = 0;
		},
		
		handleRolling: function() {
			this.vel.x = this.velStore; //constant velocity through roll
			if (this.rollTimer.delta() >= this.rollTime) {
				this.handleRollEnd();
			}
				if (ig.input.analogAxes[1] >= this.moveMag && this.checkVaultUnderCover()) {
					this.handleVaultIntoCover();
			}
		},
		
		checkVaultUnderCover: function() {
			var checkStruct = {pos: {x: this.pos.x, y: this.pos.y + 16}, size: {x: this.size.x, y: this.size.y}, _checkCoverRight : EntityPhysEnt.prototype._checkCoverRight.bind(this), _checkCoverLeft: EntityPhysEnt.prototype._checkCoverLeft.bind(this)};
			var cov = this.checkCover.bind(checkStruct)();
			if (this.flip) {
				if (cov & 2) {
					return true;
				}
			}
			//check if we have left cover underneath the center of the body
			else {
				//hurray for misdirection!
				
				if (cov & 1) {
					return true;
				}
				
			}
			return false;
		},
		
		handleVaultIntoCover: function() {
			this.pos.y += 12;
			if (this.flip) {
				this.handleRollEnd();
				this.takeCover(2);
				
			}
			else {
				//more nonsense!
				this.handleRollEnd();
				this.takeCover(1);
			}
		},
		
		dimChange: function(dimTag) {
			if (this.dimensions[dimTag]) {
				this.size = this.dimensions[dimTag].size;
				this.offset = this.dimensions[dimTag].offset;
				this.setDim(dimTag);
				this.jiggle();
			}
		},
		
		//"check under" hack : raycasting
		ledgeGrabDetect: function() {
			if (this.ledgeTimer.delta() <= this.ledgeResetTime) {
				return false;
			}
			this.raycastState = true;
			var startRay = this.body.GetPosition();
			var endRay = new Box2D.Common.Math.b2Vec2(startRay.x, startRay.y + (ig.game.collisionMap.tilesize*Box2D.SCALE));
			var ray = this._raycastValidLedgeGrab.bind(this);
			ig.world.RayCast(ray, startRay, endRay);
			if (this.flip) {
				if (this.senses.leftDetect.state == true && this.senses.leftLedgeDetect.state == false && this.raycastState) {
					return true;
				}
			}
			else {
				if (this.senses.rightDetect.state == true && this.senses.rightLedgeDetect.state == false &&this.raycastState) {
					return true;
				}
				
			}
			return false;
		},
		
		//see if you get a collision from the bottom-center of this body to one tilesize down that is on body with no entity
		_raycastValidLedgeGrab(incidentFix, hitPoint, hitNormal, fraction) {
			
			
			if (!incidentFix.GetBody().entity) {
				this.raycastState = false;
				return 0;
			}
			return -1;
			
		},
		
		ledgeGrab: function() {
			if (this.flip) {
					if (ig.input.analogAxes[0] <= -this.moveMag) {
						//set left ledge grab
						var grabTile = this.senses.leftDetect.grabTile;
						grabTile.x = (Math.ceil(grabTile.x/ig.game.collisionMap.tilesize))*ig.game.collisionMap.tilesize; 
						grabTile.y = (Math.ceil(grabTile.y/ig.game.collisionMap.tilesize))*ig.game.collisionMap.tilesize;
						//console.log("Processed Tile Pos: ", grabTile);
						this.dimChange('ledgeGrab');
						this.onLedge = true;
						this.vel.x = 0; this.vel.y = 0; this.accel.x = 0; this.accel.y = 0;
						this.pos.x = grabTile.x + 1;
						this.pos.y = grabTile.y - 9;
						this.gravityFactor = 0;
					}
			}
			else {
				if (ig.input.analogAxes[0] >= this.moveMag) {
					//set right ledge grab
					
					//find anchor tile
					var grabTile = this.senses.rightDetect.grabTile;
					//console.log("Raw tile pos: ", grabTile);
					//get upper left corner of tile
					grabTile.x = (Math.floor(grabTile.x/ig.game.collisionMap.tilesize))*ig.game.collisionMap.tilesize;
					grabTile.y = (Math.floor(grabTile.y/ig.game.collisionMap.tilesize))*ig.game.collisionMap.tilesize;
					//console.log("Processed Tile Pos: ", grabTile);
					this.dimChange('ledgeGrab');
					this.onLedge = true;
					this.vel.x = 0; this.vel.y = 0; this.accel.x = 0; this.accel.y = 0;
					this.pos.x = grabTile.x - this.size.x;
					this.pos.y = grabTile.y - 9;
					this.gravityFactor = 0; //don't fall
					
					
					
					//console.log("RIGHT LEDGE GRAB");
				}
			}
		},
		
		
		
		//contact listener resolution
		

		
		directionalCollisionContact: function(contact) {
			var fixA = contact.GetFixtureA();
			var fixB = contact.GetFixtureB();
			var id = 0;
			var tile, otherBod;
			
			//still not carrying info on who is who, so figure out which fixture is which
			//kluge: currently only collision tiles carry userdata. Should specify.
			if (fixA.GetBody().GetUserData() && fixA.GetBody().GetUserData().id) {
				id = fixA.GetBody().GetUserData().id;
				tile = fixA.GetBody();
				otherBod = fixB.GetBody();
			}
			else if (fixB.GetBody().GetUserData() && fixB.GetBody().GetUserData().id) {
				id = fixB.GetBody().GetUserData().id;
				tile = fixB.GetBody();
				otherBod = fixA.GetBody();
			}
			
			if (id == 0) {
				return;
			}
			var pts = contact.GetManifold().m_pointCount;
			var worldManifold = new Box2D.Collision.b2WorldManifold();
			contact.GetWorldManifold(worldManifold);
			switch(id) {
				case 12: 
					for (var i = 0; i < pts; i++) {
						var vel = otherBod.GetLinearVelocityFromWorldPoint(worldManifold.m_points[i]);
						if (vel.y > 0) {
							return;
						}
					}
					break;
				case 23:
					for (var i = 0; i < pts; i++) {
						var vel = otherBod.GetLinearVelocityFromWorldPoint(worldManifold.m_points[i]);
						if (vel.y < 0) {
							return;
						}
					}
					break;
				case 34:
					for (var i = 0; i < pts; i++) {
						var vel = otherBod.GetLinearVelocityFromWorldPoint(worldManifold.m_points[i]);
						if (vel.x < 0) {
							return;
						}
					}
					break;
				case 45:
					for (var i = 0; i < pts; i++) {
						var vel = otherBod.GetLinearVelocityFromWorldPoint(worldManifold.m_points[i]);
						if (vel.x > 0) {
							return;
						}
					}
					break;
				default: return; break;
			}
			//none of the criteria match, make the tile passthrough
			contact.SetEnabled(false);
			
		},
		
		//so far, only requirement is to re-enable contact in case of continuing AABB collision
		endContact: function(other, contact) {
			contact.SetEnabled(true);
			
			var fixThis;
			if (contact.GetFixtureA().GetBody().entity == this) {
				fixThis = contact.GetFixtureA();
			}
			else {
				fixThis = contact.GetFixtureB();
			}
			if (fixThis.GetUserData().type == 'sense' && other == null) {
				this.senses[fixThis.GetUserData().name].state = false;
			}
			
			this.parent(other, contact);
		},
		
		preSolve: function(other, contact, oldManifold) {
			this.directionalCollisionContact(contact);
			this.parent(other,contact, oldManifold);
		},
		
		beginContact: function (other, contact) {
			var fixThis, othFix;
			if (contact.GetFixtureA().GetBody().entity == this) {
				fixThis = contact.GetFixtureA();
				othFix = contact.GetFixtureB();
			}
			else {
				fixThis = contact.GetFixtureB();
				othFix = contact.GetFixtureA();
			}
			//sensing
			if (fixThis.GetUserData().type == 'sense' && other == null) {
				this.senses[fixThis.GetUserData().name].state = true;
				//need upper right vertex
				if (fixThis.GetUserData().name == 'leftDetect') {
					var verts = othFix.GetShape().GetVertices();
					for (var i = 0; i < verts.length; i++) {
						if (verts[i].x > 0 && verts[i].y < 0) {
							var tilePos = othFix.GetBody().GetPosition();
							var grabTile = new Box2D.Common.Math.b2Vec2((verts[i].x + tilePos.x)/Box2D.SCALE, (verts[i].y + tilePos.y)/Box2D.SCALE);
							this.senses[fixThis.GetUserData().name].grabTile = grabTile;
							break;
						}
					}
				}
				//need upper left vertex
				else if (fixThis.GetUserData().name == 'rightDetect') {
					var verts = othFix.GetShape().GetVertices();
					for (var i = 0; i < verts.length; i++) {
						if (verts[i].x < 0 && verts[i].y < 0) {
							var tilePos = othFix.GetBody().GetPosition();
							var grabTile = new Box2D.Common.Math.b2Vec2((verts[i].x +tilePos.x)/Box2D.SCALE, (verts[i].y + tilePos.y)/Box2D.SCALE);
							this.senses[fixThis.GetUserData().name].grabTile = grabTile;
							break;
						}
					}

				}
			}
			this.parent(other,contact);
		},
		
		
		
		kill: function() {
			this.parent();
		},
		
		//change cover dim, find solid tile, snap to tile
		takeCover: function(dir) {
			if (dir == 1) {
				this.inCover.left = true;
				this.inCover.oldDim.x = this.pos.x;
				this.inCover.oldDim.y = this.pos.y;
				this.dimChange('inCover');
				this.offset = {x:0, y: this.offset.y},
				this.pos.x = Math.floor(this.pos.x / ig.game.collisionMap.tilesize)*ig.game.collisionMap.tilesize; //??
				this.vel.x = 0;
				this.flip = true;
				
			}
			else if (dir == 2) {
				this.inCover.right = true;
				this.inCover.oldDim.x = this.pos.x;
				this.inCover.oldDim.y = this.pos.y;
				this.dimChange('inCover');
				var xlead = this.pos.x + this.size.x;
				//tweening to here, obviously
				this.pos.x = Math.ceil(xlead / ig.game.collisionMap.tilesize)*ig.game.collisionMap.tilesize - this.size.x;
				this.vel.x = 0;
				this.flip = false;
			}
		},
		
		unCover: function() {
			this.dimChange('normal');
			this.inCover.left = this.inCover.right = this.inCover.exposed = false;
			//this.pos.x = this.inCover.oldDim.x;
			//this.pos.y = this.inCover.oldDim.y;
			
		},
		
		expose: function() {
			this.inCover.exposed = true;
			this.dimChange('exposed');
			if (this.inCover.right) {
				
			}
			else {
				//console.log("Exposed left");
				this.offset = {x:6, y: this.offset.y};
				
			}
		},
		
		unExpose: function() {
			this.inCover.exposed = false;
			this.dimChange('inCover');
			if (this.inCover.right) {
			}
			else {
				this.offset = {x:0, y: this.offset.y};
			}
		},
		
		
		
		
		
		
	});
	
});