//switch that "fires" when shot with the blaster

ig.module('game.entities.shootSwitch')
.requires('impact.entity'
)
.defines(function() {
	EntityShootSwitch = ig.Entity.extend({
		animSheet: new ig.AnimationSheet('media/shootSwitch.png', 16, 14),
		size: {x: 16, y:14},
		switchState: false,
		sentTrigger: false,
		gravityFactor: 0,
		target: null,
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			
			this.addAnim('off', 0.4, [0]);
			this.addAnim('on', 0.4, [1]);
			this.currentAnim = this.anims.off;
			
		},
		
		receiveDamage: function(val, other) {
			if (!this.switchState) {
				this.switchState = true;
			}
		},
		
		update: function() {
			if (this.switchState && !this.sentTrigger) {
				this.currentAnim = this.anims.on;
				this.trigger();
			}
			
			
			
			this.parent();
		},
		
		trigger: function() {
			target.triggeredBy(this);
			this.sentTrigger = true;
			
		}
	});
});