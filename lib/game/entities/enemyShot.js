//enemyShot

ig.module('game.entities.enemyShot')
.requires('plugins.joncom.box2d.entity', 'game.entities.shot', 'game.const_defs')
.defines( function() {
	EntityEnemyShot = EntityShot.extend({
		maxVel: {x:80, y:80},
		checkAgainst: ig.Entity.TYPE.NONE,
		distLimit: 0, //no distance limit
		damage: 50,
		maskBits: ig.Filter.PC + ig.Filter.ENVIRON,
		categoryBits: ig.Filter.ENEMY,
		isTransient: true,
		animSheet: new ig.AnimationSheet('media/energybulletreflect.png', 6,6),
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			/*if (!ig.global.wm) {
				var fix = this.body.GetFixtureList();	//assumes only 1 (box) fixture on body
				var filterData = fix.GetFilterData();
				filterData.categoryBits = this.categoryBits;
				filterData.maskBits = this.maskBits;
				fix.SetFilterData(filterData);
			}*/
			if (!settings.vector) {
			
				var target = settings.target;
			
				//find angle to target
				var angle = this.angleTo(target);
				this.vel.x = this.maxVel.x*Math.cos(angle);
				this.vel.y = this.maxVel.y*Math.sin(angle);
			
				this.anims.idle.angle = angle;
			}
			else {
				this.anims.idle.angle = Math.atan2(this.vel.y, this.vel.x);
			}
			
		},
		
		beginContact(other, contact) {
			if (other) {
				if (contact.GetFixtureA().GetBody().entity == other) {
				}
				else {
				}
			}
			
			this.parent(other, contact);
		}
		
		

		
		
	});
});