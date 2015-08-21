//Energy Shield
//Used to block/reflect attacks
//Generated "on the fly" from attributes stored in parent entity class

ig.module('game.entities.EnergyShield')
.requires('plugins.joncom.box2d.entity',
'game.entities.shot',
'game.entities.enemyShot',
'game.const_defs',
'game.entities.physEnt'
).
defines(function() {
	EntityEnergyShield = EntityPhysEnt.extend({
		_wmIgnore :true,
		animSheet: new ig.AnimationSheet('media/shield1.png', 1, 25),
		size: {x:1, y: 25},
		offset: {x:0, y:0},
		gravityFactor: 0,
		rechargeRate: 1,
		rechargeTimer: new ig.Timer(),
		type: ig.Entity.TYPE.A,
		
		origin: null,
		
		categoryBits: ig.Filter.PC,
		maskBits: ig.Filter.ENEMY,
		isFixedRotation: true,
		
		reflectList : new Array(EntityEnemyShot),
		reflectChance : 1.0, //value between 0 and 1 for reflect chance
		
		deferredSpawn: [],
		
		
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			this.addAnim('idle', 0.4, [0]);
			this.currentAnim = this.anims.idle;
			console.log("Shield up!");
			console.log("Shield filter:", this.body.GetFixtureList().GetFilterData());
		},
		
		//add shield to "HUD" (refactor later)
		draw: function() {
			this.parent();
			
			
			
		},
		
		update: function() {
			
			//if there exist elements in the deferredSpawn table, spawn them
			//should probably move this functionality to the game object
			var entDef;
			while (entDef = this.deferredSpawn.pop()) {
				ig.game.spawnEntity(entDef.type, entDef.pos.x, entDef.pos.y, {flip: entDef.flip, origin: entDef.origin, vector: entDef.vector});
			}
			
			this.currentAnim = this.anims.idle;
			
			//KLUGE: psuedo-joint until I can figure out what's wrong with the current one.
			//this should be a weld joint
			this.pos.x = this.origin.flip ? this.origin.pos.x - 1 : this.origin.pos.x + 22;
			this.pos.y = this.origin.pos.y - 3;
			this.parent();
		},
		
		
		
		//physics
		
		beginContact: function(other, contact) {
			console.log("Shield hit!");
			if (other && other.damage) {
				this.origin.shieldStrength -= other.damage;
			}
			//reflect, which simply re-generates the same kind of entity with a new orientation
			//first, check if the incoming entity is one that can be reflected (bullets, etc: )
			var ordered;
			ordered = this._getEntsFromContact(contact);
			//this.doReflect(ordered.shield, ordered.oth, contact);
			
			
			if (this.origin.shieldStrength <= 0) {
				this.kill();
			}
			
			//KLUGE AGAIN
			//Major refactor into universal entity class that can handle collision categories
			//In the meantime...
			if (other instanceof EntityShot || other instanceof EntityEnemyShot) {
				other.kill();
			}
			
		},
		
		//shield should == this
		doReflect: function(shield, other, contact) {
			var entType = null;
			for (var i in this.reflectList) {
				if (other instanceof this.reflectList[i]) {
					entType = this.reflectList[i];
				}
			}
			if (!entType) {
				return;
			}
			//we can reflect this entity
			//should do a random check to see if the entity will actually be reflected.
			var tryReflect = Math.random();
			if (tryReflect > this.reflectChance) {
				return;
			}
			//we are clear to do the reflection
			//find the incident vector
			var incidence = new Box2D.Common.Math.b2Vec2(other.vel.x, other.vel.y);
			//var theta = Math.atan2(other.vel.y, other.vel.x);
			var normal = contact.GetManifold().m_localPlaneNormal;
			//we want the normal from the shield to the incident entity, so flip if it is backwards
			if (contact.GetFixtureA() == other) {
				normal.NegativeSelf();
			}
			//now use the reflection trick from Parberry to find the new reflected vector
			
			var dot = incidence.x*normal.x + incidence.y+normal.y;
			var outputVec = incidence.Copy();
			normal.Multiply(2*dot);	//this is now u(dot)n*2n, not just n
			outputVec.Subtract(normal);
			//get velocities from this vector... this is the last step to determining the characteristics of the reflected shot
			//We are almost certainly in a contact callback right now, so we won't be able to create this body. Defer the entity spawn until we can.
			if (ig.world.IsLocked()) {
				this.deferredSpawn.push({type: entType, pos: other.pos, flip: this.flip, origin: this, vector: outputVec});
			}
			else {
				ig.game.spawnEntity(entType, other.pos.x, other.pos.y, {flip: this.flip, origin: this, vector: outputVec}); 
			}
			
			
			
		},
		
		_getEntsFromContact: function(contact) {
			var entA = contact.GetFixtureA().GetBody().entity;
			var entB= contact.GetFixtureB().GetBody().entity;
			
			if (entA == this) {
				return {shield: entA, oth: entB};
			}
			else if (entB == this) {
				return {shield: entB, oth:entA};
			}
			else {
				//why are you checking this contact?
				return {shield: null, oth: null};
			}
		},
		
		receiveDamage: function(amount, other) {
			
		},
		
		
	});
	
});