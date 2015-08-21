ig.module('game.vision')
.requires('game.entities.physEnt')
.defines(function() {
	ig.Vision = ig.Class.extend({
		
		origin: null,
		
		//vision settings
		sightArc : 7,
		sightRange: 150,
		sights: [],
		
		//Entity knowledge
		inSight: [],	//might be an entity thing and not a sight thing
		sightEval: [],
		
		//related to raycast callbacks, finding whether sight is valid
		lineOfSight: true,
		raycastTarget: null,
		
		//must have a handle to the entity it is servicing
		init: function(origin, defSightArc, defSightRange) {
			this.origin = null;
			if (defSightArc) {
				this.sightArc = defSightArc;
			}			
			if (defSightRange) {
				this.sightRange = defSightRange;
			}
		},
		
		makeSight: function(x,y, baseAngle, sightArc, sightRange) {
			if (sightArc == null || sightArc == undefined) {
				sightArc = this.sightArc;
			}
			if (sightRange == null || sightRange == undefined) {
				sightRange = this.sightRange;
			}
			if (baseAngle == null || baseAngle == undefined) {
				baseAngle = 0;
			}
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
			fixtureDef.filter.maskBits = this.origin.maskBits;
			fixtureDef.filter.categoryBits = this.origin.categoryBits;
			var fix = this.origin.body.CreateFixture(fixtureDef);
			this.sights.push(fix);
			return fix;
		},
		
		beginContactSight: function (other, contact) {
			var sightSensor = null;
			if (contact.GetFixtureA().GetBody().entity == this.origin) {
				sightSensor = contact.GetFixtureA();
			}
			else {
				sightSensor = contact.GetFixtureB();
			}
			
			//add to sighting list for evaluation
			this.sightEval.push({sensor: sightSensor, target: other});


		},
		
		endContactSight: function(other, contact) {
			//must be a more efficient way to do this removal
			for (var i = 0; i < this.sightEval.length; i++) {
				if (this.sightEval[i].target == other) {
					this.sightEval.splice(i, 1);
				}
			}
		},
		
		update: function() {
			for (var i = 0; i < this.sightEval.length; i++) {
				this.updateSightTargets(this.sightEval[i]);
			}
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
				this.inSight.push(other);
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
		
		
		
		
	});
});