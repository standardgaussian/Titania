//stationary turret enemy
//for testing sight lines, weapons fire

ig.module('game.entities.sentinel')
.requires('game.entities.physEnt', 'game.const_defs')
.defines(function() {
	EntitySentinel = EntityPhysEnt.extend({
		animSheet: new ig.AnimationSheet('media/Sentinel.png', 22, 26),
		size: {x: 18, y: 26},
		offset: {x:2, y:0},
		categoryBits: ig.Filter.ENEMY,
		maskBits: 0xFFFF,
		friction: {x:1, y:1},
		gravityFactor: 1,
		isFixedRotation: true,
		
		//vision settings
		sightArc : 7,
		sightRange: 150,
		sights: [],
		
		//Entity knowledge
		targets: [],
		sightEval: [],
		
		//shot settings
		
		shotTimer: new ig.Timer(),
		shotCooldown: 3,
		
		//related to raycast callbacks, finding whether sight is valid
		lineOfSight: true,
		raycastTarget: null,
		
		//debug stuff
		_debugD: false,
		
		bodyType: Box2D.Dynamics.b2Body.b2_staticBody,
		
		
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			if (!ig.global.wm) {
				//belongs in AI setup code, just staple it on here for now
				this.makeSight(0, -10, 0,this.sightArc, this.sightRange);
				this.makeSight(0,-10, 180, this.sightArc, this.sightRange);
			}
			
			
			
			this.shotTimer.set(-1*this.shotCooldown);
		},
		
		//Can try to fire at multiple targets for now
		//in practice, will probably only shoot at target 0
		update: function() {
			//follow up on sight sensors
			for (var i = 0; i < this.sightEval.length; i++) {
				this.updateSightTargets(this.sightEval[i]);
			}
			//if it sees something, shoot at it
			//otherwise, do nothing
			/*for (var i = 0; i < this.targets.length; i++) {
				this.fireAt(this.targets[i]);
			}*/
			//probably powerfully inefficient
			var target;
			while (target = this.targets.pop()) {
				this.fireAt(target);
			}
			
			this.parent();
		},
		
		//make a sight sensor fixture at LOCAL body coordinates (x,y), out to range sightRange, with solid angle sightArc whose central line is at angle baseAngle from 0 (directly right)
		//assumes static, but could be made to pivot
		makeSight: function(x,y, baseAngle, sightArc, sightRange) {
			//scale 
			x = x*Box2D.SCALE;
			y = y*Box2D.SCALE;
			sightRange = sightRange*Box2D.SCALE;
			
			//create the shape of the sight
			var shapeDef = new Box2D.Collision.Shapes.b2PolygonShape();
			var segments = 8; //change for finer grain arc
			var vertices = []
			vertices.push(new Box2D.Common.Math.b2Vec2(x,y));
			for(var i = 0; i < segments-1; i++) {
				var angle = (i*(sightArc*2/(segments-2)) - sightArc + baseAngle)*(Math.PI/180);
				//console.log(i, " angle : ", angle/(Math.PI/180));
				//vertices[i+1].Set(sightRange*Math.cos(angle) + x, sightRange*Math.sin(angle) + y);
				vertices.push(new Box2D.Common.Math.b2Vec2(sightRange*Math.cos(angle) + x, sightRange*Math.sin(-angle) + y));
			}
			shapeDef.SetAsArray(vertices, vertices.length);
			var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
			fixtureDef.shape = shapeDef;
            fixtureDef.density = 0;
            fixtureDef.friction = 0;
            fixtureDef.restitution = 0;
			fixtureDef.userData = {name: 'sight'};
			fixtureDef.isSensor = true;
			fixtureDef.filter.maskBits = this.maskBits;
			fixtureDef.filter.categoryBits = this.categoryBits;
			var fix = this.body.CreateFixture(fixtureDef);
			this.sights.push(fix);
			return fix;
		},
		
		//since the only sensors in this entity are sight, we don't need to check their type... but generally, we should
		beginContact: function(other, contact) {
			if(other && contact.IsSensor()) {
				this._beginContactSight(other, contact);
			}
			//shouldn't be an else
			else {
				this._beginContactPhysical(other, contact);
			}
			this.parent(other, contact);
		},
		
		//MOST OF THIS SHOULD BE IN PRESOLVE
		//It is not only possible, but very likely that a target will be in LOS after contact with the sight sensor begins
		_beginContactSight: function (other, contact) {
			var sightSensor = null;
			if (contact.GetFixtureA().GetBody().entity == this) {
				sightSensor = contact.GetFixtureA();
			}
			else {
				sightSensor = contact.GetFixtureB();
			}
			
			//add to sighting list for evaluation
			this.sightEval.push({sensor: sightSensor, target: other});


		},
		
		updateSightTargets: function(sightEvalStruct) {
			var sightSensor = sightEvalStruct.sensor;
			var other = sightEvalStruct.target;
			//reset the LOS and global target parameters to prep for raycasting
			this.lineOfSight = true;
			this.raycastTarget = other;
			//we will raycast from the starting point of the sight cone
			var start = new Box2D.Common.Math.b2Vec2 (sightSensor.GetBody().GetPosition().x + sightSensor.GetShape().GetVertices()[0].x,
				sightSensor.GetBody().GetPosition().y + sightSensor.GetShape().GetVertices()[0].y);
			
			//at a first approximation, just raycast to the center of the target. Future refinements may include multiple raycasts to different vertices of the target
			var end = other.body.GetPosition();
			
			//not sure if there is a more efficient way to define this, ie. not on-the-fly
			//But we need to bind "this" to the entity object since the callback uses the HTML window element
			var raycastCallback = this._raycastSightLine.bind(this);
			
			ig.world.RayCast(raycastCallback, start, end);
			
			if (this.lineOfSight) {
				this.targets.push(other);
			}
		},
		
		_raycastSightLine(incidentFix, hitPoint, hitNormal, fraction) {
			//for sight line, we don't care about anything other than whether there is a solid object in between the origin and the target
			//at a first approximation, don't fire if *anything* solid is in the way. Later, may check whether solid fixtures are a part of a body that the origin entity does not interact with
			//eg. it could shoot through friendlies... it should at the very least be able to see through friendlies!
			
			//first, ignore this intersection if the incidentFix is actually a part of the target
			if (incidentFix.GetBody().entity == this.raycastTarget) {
				return -1;
			}
			//now, ignore the intersection if the incidentFix is a sensor
			else if (incidentFix.IsSensor()) {
				return -1;
			}
			//if it's not a part of the target and is not a sensor, then it is a solid object in the way of the ray.
			else {
				this.lineOfSight = false;
				return 0; //terminates the raycasting
			}
			
		},
		
		_beginContactPhysical: function(other, contact) {
			
		},
		
		endContact: function(other, contact) {
			if (other && contact.IsSensor()) {
				this._endContactSight(other, contact);
			}
			else {
				this._endContactPhysical(other, contact);
			}
			this.parent(other, contact);
		},
		
		_endContactSight: function(other, contact) {
			//must be a more efficient way to do this removal
			for (var i = 0; i < this.sightEval.length; i++) {
				if (this.sightEval[i].target == other) {
					console.log("Lost target!");
					this.sightEval.splice(i, 1);
				}
			}
		},
		
		_endContactPhysical: function(other, contact) {
			
		},
		
		fireAt: function(targetEnt) {
			//only shoot at something that is not dead...
			if (this.shotTimer.delta() > this.shotCooldown && !targetEnt._killed) {
				var dir = 0;
				//this.localSpawnEntity(EntityEnemyShot, 0,-10 , {flip: this.flip, origin: this, dir: dir, target:targetEnt});
				ig.game.spawnEntity(EntityEnemyShot, this.pos.x, this.pos.y, {flip: this.flip, origin: this, dir: dir, target:targetEnt});
				this.shotTimer.set(0);
			}
		},
		
		setupAnimation: function() {
			this.addAnim('idle', 0.4, [0]);
		},
		
		draw: function() {
			this.parent();
			/*
			var bodyPos = this.body.GetPosition();
			
			//kind of debug for vision
			//just draw a line
			var ctx = ig.system.context;
			ctx.strokeStyle = 'rgba(255,0,0,1';
			var firstSight = this.sights[1];
			for (var i = 1; i < firstSight.GetShape().GetVertices().length ; i++) {
				var fixOrigin = firstSight.GetShape().GetVertices()[0];
				var firstStroke = firstSight.GetShape().GetVertices()[i];
				var worldOrigin = {
					x: (bodyPos.x/Box2D.SCALE) + (fixOrigin.x)/Box2D.SCALE,
					y: (bodyPos.y/Box2D.SCALE) + (fixOrigin.y)/Box2D.SCALE,
				};
				var worldStroke = {
					x: (bodyPos.x/Box2D.SCALE) + (firstStroke.x)/Box2D.SCALE,
					y: (bodyPos.y/Box2D.SCALE) + (firstStroke.y)/Box2D.SCALE,
				};
				//console.log("Drawing from ", worldOrigin, " to ", worldStroke);
				ctx.beginPath();
				ctx.moveTo(ig.system.getDrawPos(worldOrigin.x - ig.game.screen.x), ig.system.getDrawPos(worldOrigin.y - ig.game.screen.y));
				ctx.lineTo(ig.system.getDrawPos(worldStroke.x - ig.game.screen.x), ig.system.getDrawPos(worldStroke.y - ig.game.screen.y));
				ctx.stroke();
				
			}
			//just draw a rect at the sight origin
			/*var fixOrigin = this.sights[0].GetShape().GetVertices()[0];
			var worldOrigin = {
				x: (bodyPos.x/Box2D.SCALE) + fixOrigin.x,
				y: (bodyPos.y/Box2D.SCALE) + fixOrigin.y,
			};
			ctx.strokeRect(
				 ig.system.getDrawPos(worldOrigin.x - ig.game.screen.x),
				 ig.system.getDrawPos(worldOrigin.y - ig.game.screen.y),
				 ig.system.getDrawPos(10),
				 ig.system.getDrawPos(10)
			);*/
			
		},
		
		receiveDamage: function(amount, other) {
			//overwritten to not receive damage
		},
		
	});
});