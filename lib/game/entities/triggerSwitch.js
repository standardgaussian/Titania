//extends trigger
//triggers when it receives damage

ig.module('game.entities.triggerSwitch')
.requires('game.entities.trigger')
.defines(function() {
	EntityTriggerSwitch = EntityTrigger.extend({
			_wmScalable: false,
			_wmDrawBox: false,
		
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		animSheet: new ig.AnimationSheet('media/shootSwitch.png', 16, 14),
		size: {x: 16, y:14},
		
		init: function(x,y, settings) {
			this.parent(x,y,settings);
			
			this.addAnim('off', 0.4, [0]);
			this.addAnim('on', 0.4, [1]);
			this.currentAnim = this.anims.off;
		},
		
		receiveDamage: function (amount, other) {
			if (this.canFire) {
				this.check(other);
				this.toggleAnim();
			}
			
			
		},
		
		check: function(other) {
			this.parent(other);
		},
		
		toggleAnim: function() {
			if (this.currentAnim == this.anims.off) {
				this.currentAnim = this.anims.on;
			}
			else {
				this.currentAnim = this.anims.off;
			}
		}
	});
});