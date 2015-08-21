//melee energy ball

ig.module('game.entities.melee')
.requires('game.entities.physEnt')
.defines(function() {
	EntityMelee = EntityPhysEnt.extend({
		animSheet: new ig.AnimationSheet('media/meleesheet.png', 10, 10),
		size: {x: 10, y:10},
		offset: {x: 0, y:0},
		categoryBits: ig.Filter.FRIENDLY,
		maskBits: ig.Filter.ENEMY, // + non-enemy environment stuff, but ENVIRON is currently only for solid tiles
		meleeTimer: new ig.Timer(),
		lifetime: 0.5,
		dmg: 1,
		density: 0.1,
		maxVel: {x: 75, y: 300},
		flip: false,
		meleePushImpulse: 100, //how far melee flings you forward. Should make sure this is, overall, less than you could traverse while walking/running in the lifetime of the punch, or else it's a movement exploit
		meleeHitImpulse: 40, //how hard melee flings an enemy when hit.
		gravityFactor: 0,
		origin: null,
		
		//we're going to weld this to the player, so no need for fancy updating
		init: function(x,y, settings) {
			this.parent(x,y,settings);
			this.flip = settings.flip;
			this.origin = settings.origin;
			this.meleeTimer.set(0);
			this.currentAnim.flip.x = this.flip;
		},
		
		update: function() {
			if (this.meleeTimer.delta() >= this.lifetime) {
				this.kill();
				this.origin.dimChange('normal');
			}
			this.currentAnim.flip.x = this.flip;
			this.parent();
		},
		
		beginContact: function(other, contact) {
			if (other && other.receiveDamage && contact.GetManifold().m_pointCount > 0 ) {
				other.receiveDamage(this.dmg);
				var fixThis, othFix, worldMan, manifoldNorm, contactPoint;
				worldMan = new Box2D.Collision.b2WorldManifold();
				if (contact.GetFixtureA().GetBody().entity == this) {
					fixThis = contact.GetFixtureA();
					othFix = contact.GetFixtureB();
					contact.GetWorldManifold(worldMan);
					manifoldNorm = worldMan.m_normal;
					//piecewise report
					//console.log("Local point: ", contact.GetManifold().m_points[0].m_localPoint);
					//console.log("World Point: ", this.body.GetWorldPoint(contact.GetManifold().m_points[0].m_localPoint));
					//console.log("New local point: ", other.body.GetLocalPoint(this.body.GetWorldPoint(contact.GetManifold().m_points[0].m_localPoint)));
					contactPoint = other.body.GetLocalPoint(worldMan.m_points[0]);
				}
				else {
					fixThis = contact.GetFixtureB();
					othFix = contact.GetFixtureA();
					worldMan = contact.GetWorldManifold(worldMan);
					manifoldNorm = worldMan.m_normal.Copy().NegativeSelf();
					contactPoint = other.body.GetLocalPoint(worldMan.m_points[0]);
				}
				manifoldNorm.Normalize();
				//console.log(manifoldNorm);
				//console.log(contactPoint);
				//debug draw
				
				var ctx = ig.system.context;
				 var begin = other.body.GetPosition().Copy();
				 var end = contactPoint.Copy();
				 ig.game.contactStart = begin;
				 ig.game.contactEnd = other.body.GetWorldPoint(end);
				 ig.game.contactDraw = true;
				ctx.strokeStyle = 'rgba(255,0,0,1)';
				
				 ctx.beginPath();
				 ctx.moveTo(ig.system.getDrawPos(other.body.GetPosition().x/Box2D.SCALE - ig.game.screen.x), ig.system.getDrawPos(other.body.GetPosition().y/Box2D.SCALE - ig.game.screen.y));
				 ctx.lineTo(ig.system.getDrawPos(other.body.GetWorldPoint(contactPoint).x/Box2D.SCALE - ig.game.screen.x), ig.system.getDrawPos(other.body.GetWorldPoint(contactPoint).y/Box2D.SCALE - ig.game.screen.y));
				 ctx.stroke();
				console.log(manifoldNorm);
				console.log(worldMan.m_points[0]);
				other.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(this.meleeHitImpulse*manifoldNorm.x, this.meleeHitImpulse*manifoldNorm.y), worldMan.m_points[0]); // lol. Need to learn appropriate application of forces...
				
				
			}
		},
		
		setupAnimation: function() {
			this.addAnim('idle', this.lifetime/6, [0,1,2]);
		},
		
	});
});