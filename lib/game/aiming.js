//Aim utility
//Primary form of use is to input raw controller data, get back a "targeting solution"
//also handles utility to draw crosshairs/reticule
ig.module('game.aiming')
.requires('game.const_defs',
'plugins.interpolation'
).
defines (function() {
	ig.Aiming = ig.Class.extend({
		//normalized? aiming vector
		aimVector :{x:1, y: 0},
		aimAngle : function() {
			return Math.atan2(this.aimVector.y, this.aimVector.x);
		},
		
		//use units in seconds 
		interpTimer: new ig.Timer(),
		interpSpeed: 0.2,
		
		//jitter trap
		trapRadius: 0.01, //will probably need some re-jiggering
		//relaxation
		idleMag: 0.25,
		
		targetX: 0,
		targetY: 0,
		
		origin: null,
		
		coarseMag: 0.7,
		
		
		init: function(origin) {
			this.origin = origin;
		},
		
		update: function(xL, yL, xR, yR) {
			var dominant = true;
			var x, y;
			//relaxation
			if (xR*xR + yR*yR <= this.idleMag*this.idleMag) {
				x = this.aimVector.x < 0 ? -1 : 1;
				y = 0;
				dominant = false;
				if (yL >= this.coarseMag) {
					y = 1;
				}
				else if (yL <= -this.coarseMag) {
					y = -1;
				}
				if (xL >= this.idleMag) {
					x = 1;
				}
				else if (xL <= -this.idleMag) {
					x = -1;
				}
			}
			else {
				x = xR;
				y = yR;
			}
			//trap
			if ((x-this.targetX)*(x-this.targetX) + (y-this.targetY)*(y-this.targetY) >= this.trapRadius*this.trapRadius) {
				this.targetX = x;
				this.targetY = y;
				this.interpTimer.reset();
			}
			if (this.interpTimer.delta() > this.interpSpeed) {
				return;
			}
	
		
		
			this.aimVector = {x: ig.Interpolation.lerp(this.interpTimer.delta(), this.aimVector.x, this.targetX, this.interpSpeed),
				y: ig.Interpolation.lerp(this.interpTimer.delta(), this.aimVector.y, this.targetY, this.interpSpeed)};
				
		//console.log("New aim vector: ", this.aimVector.x, this.aimVector.y);
		
		},
		
		
	
	});
});