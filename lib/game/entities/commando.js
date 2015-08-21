//basic enemy unit
//lets see how to apply all this jazz!

ig.module('game.entities.commando').
requires('game.vision', 'game.entities.physEnt', 'game.entities.rifle').
defines(function() {
	EntityCommando = EntityPhysEnt.extend({
		animSheet: new ig.AnimationSheet('media/commandosheet.png', 22, 22);
		size: {x:22, y:22},
		offset: {x: 0, y:0},
		
		vision: null,
		rifle: null,
		
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			
			this.vision = new ig.Vision(this, 25, 200);
			this.vision.makeSight(1, -6, 0);
		},
		
		update: function() {
			this.vision.update();
			//get vision data
			var targets = this.vision.InSight;
		},
		
		beginContact: function(other, contact) {
			if (other && contact.isSensor()) {
				this.vision.beginContactSight(other, contact);
			}
		},
		
		endContact: function(other, contact) {
			if (other && contact.isSensor()) {
				this.vision.endContactSight(other, contact);
			}
		},
	});
	
});