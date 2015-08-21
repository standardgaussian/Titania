ig.module('game.entities.EMH').
requires('impact.entity').
defines(function() {
	EntityEMH = ig.Entity.extend({
		animSheet: new ig.AnimationSheet('media/EMHMergedSheet.png', 16, 16),
		size: {x: 14, y:15},
		offset: {x:1, y:1},
		flip: false,
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			this.addAnim('idle', 0.5, [0,1]);
			this.currentAnim = this.anims.idle;
		},
		
		update() {
			this.parent();
		},
		
		
		
	});
	
});