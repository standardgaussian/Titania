//basic physics entity
//This entity extends the joncom base entity and is responsible for
//collision categories
//property inheritance
//default settings/hooks
//It also defines the ObjectWorld and RenderWorld objects "soma" and "animus" (or whatever distinct names you can think of)
//The soma cannot call animus functions and vice versa. Both must be called from top level functions like update, init, draw, or top level physics callbacks like beginContact, preSolve, etc:.
//This is to maintain separation between ObjectWorld and RenderWorld

ig.module('game.entities.physEnt')
.requires('plugins.joncom.box2d.entity', 'game.const_defs', 'plugins.tween', 'plugins.tileUtil')
.defines(function() {
	EntityPhysEnt = ig.Entity.extend({
		//default settings, overwritten by _loadSettings
		gravityFactor: 1,
		categoryBits: ig.Filter.NOCOLLIDE,
		maskBits: ig.Filter.ALL,
		isTransient: false,
		currentDim: 'normal',
		currentFix: null,
		
		
		init: function( x, y, settings ) {
			
			//inject filter data into settings before creating box2d body
			settings.categoryBits = this.categoryBits;
			settings.maskBits = this.maskBits;
			this.parent( x, y, settings );
			//this._loadSettings(settings);
			
			//presume non-rotating body
			//will almost certainly be entity-specific later
			if (!ig.global.wm) {
				this.body.SetFixedRotation(this.isFixedRotation);
				this.currentFix = this.body.GetFixtureList();
			}
			
			
			
			this.setupAnimation();
		},
		
		//checks that allow zero value... is there a shorter way to handle this?
		//allows entities to get context-sensitive properties, though most settings will still be pre-defined
		_loadSettings: function(settings) {
			if (typeof(settings.categoryBits) !== 'null' && typeof(settings.categoryBits) !== 'undefined') {
				console.log("Category is happening");
				this.categoryBits = settings.categoryBits;
			}
			if (typeof(settings.maskBits) !== 'null' && typeof(settings.maskBits) !== 'undefined' ) {
				console.log("Mask is happening");
				this.maskBits = settings.maskBits;
			}
			if (typeof(settings.gravityFactor) !== 'null' && typeof(settings.gravityFactor) !== 'undefined') {
				console.log("Gravity is happening");
				this.gravityFactor = settings.gravityFactor;
			}
			if (typeof(settings.isFixedRotation) !== 'null' && typeof(settings.isFixedRotation) !== 'undefined') {
				console.log("Rotation is happening");
				this.isFixedRotation = settings.isFixedRotation;
			}
			if (settings.isTransient !== 'null' && settings.isTransient !== undefined) {
				console.log("Transient is happening");
				this.isTransient = settings.isTransient;
			}
			
		},
		
		
		beginContact: function(other, contact) {
			this.parent(other,contact);
		},


		setupAnimation: function() { },
		
		//creates a sensor fixture for altering an entity's shape or size
		makeDim: function(name, size, filterSettings) {
			var shapeDef = new Box2D.Collision.Shapes.b2PolygonShape();
			
			shapeDef.SetAsBox(size.x / 2 * Box2D.SCALE, size.y / 2 * Box2D.SCALE);
			var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
            fixtureDef.shape = shapeDef;
            fixtureDef.density = 0; //massless sensor
            fixtureDef.friction = this.uniFriction;
            fixtureDef.restitution = this.bounciness;
			fixtureDef.userData = {name: name, categoryBits: null, maskBits: null, type: 'dim'};
			if (filterSettings) {
				fixtureDef.userData.categoryBits = filterSettings.categoryBits;
				fixtureDef.userData.maskBits = filterSettings.maskBits;
			}
			else {
				fixtureDef.userData.categoryBits = this.body.GetFixtureList().GetFilterData().categoryBits;
				fixtureDef.userData.maskBits = this.body.GetFixtureList().GetFilterData().maskBits;
			}
			fixtureDef.filter.categoryBits = ig.Filter.NOCOLLIDE;
			fixtureDef.filter.maskBits = ig.Filter.NOCOLLIDE;
			fixtureDef.isSensor = true;
			this.body.CreateFixture(fixtureDef);
		},
		
		//set a sensor fixture as the solid fixture that represents the entity. Automatically turns the current solid fixture into a sensor (standby).
		setDim: function(name) {
			var fix = this.body.GetFixtureList();
			var curr = null;
			var next = null;
			do {
				if (fix.GetUserData().name == name) {
					next = fix;
				}
				if (fix.GetUserData().name == this.currentDim) {
					curr = fix;
				}
				if (next && curr) {
					break;
				}
			} while (fix = fix.GetNext());
			if (next && curr) {
				next.SetDensity(curr.GetDensity());	//should actually set to a density that sets the same mass
				curr.SetSensor(true);
				next.SetSensor(false);
				curr.SetDensity(0);
				this.currentDim = name;
				this.currentFix = next;
				
				var filt = curr.GetFilterData();
				filt.categoryBits = ig.Filter.NOCOLLIDE;
				filt.maskBits = ig.Filter.NOCOLLIDE;
				curr.SetFilterData(filt);
				
				filt = next.GetFilterData();
				filt.categoryBits = next.GetUserData().categoryBits;
				filt.maskBits = next.GetUserData().maskBits;
				next.SetFilterData(filt);
			}
			else {
				//PANIC
				console.log("PANIC");
			}
		},
		
		makeSense: function(name, senseObj) {
			var shapeDef = new Box2D.Collision.Shapes.b2PolygonShape();
			shapeDef.SetAsOrientedBox(senseObj.size.x*Box2D.SCALE/2, senseObj.size.y*Box2D.SCALE/2, new Box2D.Common.Math.b2Vec2(senseObj.pos.x*Box2D.SCALE, senseObj.pos.y*Box2D.SCALE), 0);
			var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
            fixtureDef.shape = shapeDef;
            fixtureDef.density = 0; //massless sensor
            fixtureDef.friction = 0;
            fixtureDef.restitution = 0;
			fixtureDef.userData = {name: name, categoryBits: senseObj.categoryBits, maskBits: senseObj.maskBits, type: 'sense'};
			fixtureDef.filter.categoryBits = senseObj.categoryBits;
			fixtureDef.filter.maskBits = senseObj.maskBits;
			fixtureDef.isSensor = true;
			senseObj.fixture = this.body.CreateFixture(fixtureDef);
			console.log(senseObj.fixture.GetFilterData());
		},
		
		
		getFirstNonSensor: function() {
				for (var fix = this.body.GetFixtureList(); fix; fix = fix.GetNext()) {
					if (!fix.IsSensor()) {
						return fix;
					}
				}
				return null;
		},
		
		//dump all fixture info to console
		_dumpFixtureData: function() {
			console.log("***FIXTURE DUMP***");
			for (var fix = this.body.GetFixtureList(); fix; fix = fix.GetNext()) {
				console.log(fix);
			}
			console.log("***END FIX DUMP***");
		},
		
		
		//draw all non-sensor, massive fixtures associated with this entity
		_debugDraw: function() {
			for (var fix = this.body.GetFixtureList(); fix; fix = fix.GetNext()) {
				if (!fix.IsSensor() && fix.GetDensity()) {
					this._debugDrawFixture(fix, 0);
				}
			}
		},
		
		//draw all fixtures associated with this entity, regardless of status
		_debugDrawAll: function() {
			for (var fix = this.body.GetFixtureList(); fix; fix = fix.GetNext()) {
				this._debugDrawFixture(fix, 0);
			}
		},
		
		//draw the given fixture, using the second parameter to generate a random outline color
		//guess we ignore colorRand for now...
		//currently only works for 4 vertex box shapes
		//WILL NOT ERROR CHECK. The function will only work if the fixture's shape is an axially aligned box
		_debugDrawFixture: function(fix, colorRand) {
			if (!fix.GetUserData().color) {
				var r = Math.floor(Math.random() * 255);
				var g = Math.floor(Math.random() * 255);
				var b = Math.floor(Math.random() * 255);
				fix.SetUserData({name: fix.GetUserData().name, 
					color: { r: r, g: g, b:b}
				});
			}
			var color = fix.GetUserData().color;
			ig.system.context.strokeStyle = 'rgba(' + color.r.toString() + ',' + color.g.toString() + ',' + color.b.toString() + "," + '1)';
			//figure out where we need to draw this box...
			var bodyPos = this.body.GetPosition(); //center and scaled
			var fixShape = fix.GetShape().GetVertices();
			var width, height = null;
			//lazy method to find width and height
			for (var i = 0; i < fixShape.length; i++) {
				for (var j = 0; j < fixShape.length; j++) {
					if (i == j) continue;
					if (fixShape[i].x == fixShape[j].x) {
						if (height == null) {
							height = Math.abs(fixShape[i].y - fixShape[j].y)/ Box2D.SCALE;
						}
					}
					if (fixShape[i].y == fixShape[j].y) {
						if (width == null) {
							width = Math.abs(fixShape[i].x - fixShape[j].x)/ Box2D.SCALE;
						}
					}
				}
			}
			var worldPos = {
				x: (bodyPos.x/Box2D.SCALE) - width/2,
				y: (bodyPos.y/Box2D.SCALE) - height/2,
			};
			//console.log("Drawing rect @ ", worldPos);
			//console.log("Body position @ ", this.pos);
			ig.system.context.strokeRect(
				 ig.system.getDrawPos(worldPos.x - ig.game.screen.x),
				 ig.system.getDrawPos(worldPos.y - ig.game.screen.y),
				 ig.system.getDrawPos(width),
				 ig.system.getDrawPos(height)
			);
		},
		
		draw: function() {
			this.parent();
			if (this._debugD) {
				this._debugDraw();
			}
		},
		
		//spawn an entity @ local body coordinates rather than world coordinates
		//x and y are already scaled (in pixels). Technically not local coords then
		localSpawnEntity: function(entityType, x, y, settings) {
			var worldX = this.body.GetPosition().x + x;
			var worldY = this.body.GetPosition().y + y;
			ig.game.spawnEntity(entityType, worldX, worldY, settings);
		},
		
		//passthrough
		//some serious issues with getting rid of bodies...
		kill: function() {
			this.parent();
			if (this.body && this._killed) {
				ig.game.entityKillList.push(this.body);
			}
		},
		
		update: function() {
			this.parent();
		},
		
		//left = 1
		//right = 2
		//just checks if the current setup would result in cover
		//unit is responsible for making sure all other conditions are met
		checkCover: function() {
			var result = 0;
			if (this._checkCoverRight()) {
				result += 2;
			}
			if (this._checkCoverLeft()) {
				result +=1;
			}
			return result;
		},
		
		_checkCoverRight: function() {
			var leading = {x: this.pos.x + this.size.x, y: this.pos.y + this.size.y};
			var checkCoord = tileUtil.pxToTile(leading.x, leading.y);
			checkCoord.tX += 1;
			var pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 1 ) {	//only regular solid blocks for now
				return false;
			}
			if (pixelCoord.pX - (this.pos.x + this.size.x) > 8) {
				return false;
			}
			checkCoord.tY -= 1;
			pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 0) {	//only totally blank spaces for now
					return false;
			}
			checkCoord.tX -= 1;
			pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 0) {
				return false;
			}
			//underneath
			checkCoord.tY += 2;
			pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 1) {
				return false;
			}
			return true;
			
		},
		
		//almost carbon copy!
		_checkCoverLeft: function() {
			var leading = {x: this.pos.x, y: this.pos.y + this.size.y};
			var checkCoord = tileUtil.pxToTile(leading.x, leading.y);
			checkCoord.tX -= 1;
			var pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 1 ) {	//only regular solid blocks for now
				return false;
			}
			if (this.pos.x - pixelCoord.pX > 24) {
				return false;
			}
			checkCoord.tY -= 1;
			pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 0) {	//only totally blank spaces for now
					return false;
			}
			checkCoord.tX += 1;
			pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 0) {
				return false;
			}
			//underneath
			checkCoord.tY += 2;
			pixelCoord = tileUtil.tileToPx(checkCoord.tX, checkCoord.tY);
			if (ig.game.collisionMap.getTile(pixelCoord.pX, pixelCoord.pY) != 1) {
				return false;
			}
			return true;
		},
			

		
	});
});