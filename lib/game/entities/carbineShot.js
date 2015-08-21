//carbine shot

ig.module('game.entities.carbineShot').
requires('game.entities.physEnt')
.defines( function() {
	EntityCarbineShot = EntityPhysEnt.extend({
		animSheet: new ig.AnimationSheet('media/tinyenergybullet.png', 6, 1),
		size: {x: 6, y:1},
		offset: {x: 0, y:0},
		categoryBits: ig.Filter.FRIENDLY,	//probably going to need to adjust the categories for neutral objects like bullets
		maskBits: ig.Filter.ALL - ig.Filter.PC,	//hit everything except yourself
	
		_wmIgnore: true,
		
		//game units (pixels)
		dmgRanges: [24, 136],
		dmgMods:[0.75, 1, 0.85],
		damage: 5,
		maxVel: {x: 500, y:500},
		gravityFactor: 0,
		shotAngle: 0,
		
		isBullet: true,
		
		origin: null,
		originPoint: {x:0, y:0},
		
		
		init: function(x,y,settings) {
			this.origin = settings.origin;
			this.parent(x,y,settings);
			//settings.shotAngle = 0; //force straight
			this.shotAngle = settings.shotAngle;
			this.vel.x = this.maxVel.x*(Math.cos(settings.shotAngle));
			this.vel.y = this.maxVel.y*(Math.sin(settings.shotAngle));
			
			//this.originPoint.x = this.body.GetPosition().x/Box2D.SCALE;
			//this.originPoint.y = this.body.GetPosition().y/Box2D.SCALE;
			this.originPoint.x = x;
			this.originPoint.y = y;
			this.body.SetAngle(this.shotAngle);
		},
	
		//leave a wake
		//right only, so far
		draw: function() {
			this.currentAnim.angle = this.shotAngle;
			this.parent();
			var ctx = ig.system.context;
			ctx.strokeStyle = 'rgba(24,205,232,0.3)';
			ctx.beginPath();
			ctx.moveTo(ig.system.getDrawPos(this.originPoint.x  - ig.game.screen.x), ig.system.getDrawPos(this.originPoint.y- ig.game.screen.y));
			ctx.lineTo(ig.system.getDrawPos(this.body.GetPosition().x/Box2D.SCALE - ig.game.screen.x), ig.system.getDrawPos(this.body.GetPosition().y/Box2D.SCALE - ig.game.screen.y));
			ctx.stroke();
			
			
		},
		
		//calculates damage without modifiers other than distance for now
		//also doesn't account for reflections!
		beginContact: function(other, contact) {
			var modDmg = this.damage;
			if (other && other.receiveDamage) {
				if (this.distanceTo(this.origin) < this.dmgRanges[0]) {
					modDmg *= this.dmgMods[0];
				}
				//more foolproof way would be to make 2 checks, but this structure can be refactored into a more generic form
				else if (this.distanceTo(this.origin) < this.dmgRanges[1]) {
					modDmg *= this.dmgMods[1];
				}
				else if (this.distanceTo(this.origin) >= this.dmgRanges[1]) {
					modDmg *= this.dmgMods[2];
				}
				other.receiveDamage(modDmg, this);
			}
			this.kill();
			
		},
	
		setupAnimation: function() {
			this.addAnim('idle', 1, [0]);
		}
	
	});
	
	
});