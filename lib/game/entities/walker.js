ig.module(
'game.entities.walker')
.requires(
'plugins.box2d.entity'
)
.defines(function() {
	EntityWalker = ig.Box2DEntity.extend({
		animSheet: new ig.AnimationSheet('media/zombie.png', 16, 16),
		size : {x:8, y:14},
		offset: {x:4, y:2},
		maxVel: {x:100, y:100},
		flip:false,
		speed:14,
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,
		health: 20,
		
		init: function(x, y, settings) {
			this.parent(x, y, settings);
			this.addAnim('walk', 0.07, [0,1,2,3,4,5]);
		},
		
		update: function() {
			//check for edges
			if (!ig.game.collisionMap.getTile(
				this.pos.x + (this.flip ? +4 : this.size.x - 4),
				this.pos.y + this.size.y +1) && this.standing
				)
				{
					this.flip = !this.flip;
				}
				
			//check contacts
			var contact = this.body.GetContactList();
			do {
				if (contact.other.type == Box2D.Dynamics.b2Body.b2_staticBody) {
					if (!this.flip && contact.other.GetPosition().x > this.body.GetPosition().x) {
						this.flip = !this.flip;
						break;
					}
					else if (this.flip && contact.other.GetPosition().x < this.body.GetPosition().x) {
						this.flip = !this.flip;
						break;
					}
				}
				
		} while (contact = contact.next);
			
			var xdir = this.flip ? -1 : 1;
			this.body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(this.speed*xdir, 0));
			this.currentAnim.flip.x = this.flip;
			this.parent();
		},
		
		handleMovementTrace: function (res) {
			Entity.prototype.handleMovementTrace(res);
			if (res.collision.x) {
				this.flip = !this.flip;
			}
			
		},
		
		check: function(other) {
			other.receiveDamage(45, this);
		},
		
		
	});
	

	
});