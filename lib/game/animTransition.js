//animation transition class
//wrapper object that plays a transition animation, then sets the "real" animation when it's done
//Requires that the animations in question already be defined by the origin object. 
//initialize by direct access to animation object, NOT the object name, but may be extended to support that functionality

ig.module('game.animTransition').
requires('game.entities.physEnt', 'impact.animation').
defines(function() {
	ig.AnimTransition = ig.Animation.extend({
		
		transitionAnim: null,
		endAnim: null,
		origin: null,
		callback: null,
		
		init: function(origin, transitionAnim, endAnim, callback) {
			this.transitionAnim = transitionAnim;
			this.endAnim = endAnim;
			this.origin = origin;
			this.transitionAnim.rewind();
		},
		
		update: function() {
			if (this.transitionAnim.loopCount < 1) {
				this.transitionAnim.update();
				return;
			}
			else if (this.callback) {
					this.callback();	//tell someone that the transition is over
					this.callback = null; //don't do it more than once
			}
			this.endAnim.update();
		},
		
		draw: function() {
			if (this.transitionAnim.loopCount < 1) {
				this.transitionAnim.draw();
			}
			else {
				this.endAnim.draw();
			}
		},
		
		rewind: function() {
			this.transitionAnim.rewind();
			this.endAnim.rewind();
			return this;
		}
		
	});
});