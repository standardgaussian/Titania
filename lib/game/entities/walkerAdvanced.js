ig.module('game.entities.walkerAdvanced')
.requires('impact.entity',
	'game.entities.walker'
	)
.defines(function() {
	EntityWalkerAdvanced = EntityWalker.extend({
		animSheet: new ig.AnimationSheet('media/zombieAdvanced.png', 16, 16),
		
		sightDist: 250,
		verticalAngle: 30,
		
		ramSpeed: 100,
		
		update: function() {
			//line of sight of player
			//LOS functionality should be abstracted at some point
			var player = ig.game.getEntitiesByType(EntityPlayer)[0];
			//facing right
			if (player) {
				if (!this.flip) {
					if (player.pos.x > this.pos.x && Math.abs(this.angleTo(player)) < this.verticalAngle && this.distanceTo(player) < this.sightDist) {
						this.vel.x = this.ramSpeed;
						ig.Entity.prototype.update.apply(this);
					}
				}
				//facing left
				else {
					if (player.pos.x < this.pos.x && Math.abs(this.angleTo(player)) < this.verticalAngle && this.distanceTo(player) < this.sightDist) {
						this.vel.x = -this.ramSpeed;
						ig.Entity.prototype.update.apply(this);
					}
				}
			}
			this.parent();
			
			
			
			
		},
		
		
	});
});