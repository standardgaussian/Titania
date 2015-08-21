//slime

//sticks to surfaces

ig.module('game.entities.slime')
.requires('impact.entity',
'plugins.tileUtil'
)
.defines(function() {
	EntitySlime = ig.Entity.extend({
		animSheet : new ig.AnimationSheet('media/enemies.png', 16, 16),
		size: {x: 12, y: 13},
		regSize: {x: 12, y:13},
		moveSize: {x: 16, y: 13},
		offset: {x: 2, y:3},
		regOffset: {x:2, y:3},
		moveOffset: {x:0, y:3},
		
		health: 30,
		flip: false,
		friction: {x: 0, y:0},
		speed: 20,
		maxVel: {x:100, y:150},
		type: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,
		checkAgainst: ig.Entity.TYPE.A,
		gravityFactor: 0,
		playerRef: null,
		
		STATE : {
		AIRBORNE: 0,
		STANDING : 1,
		LEFTWALL: 2,
		RIGHTWALL:3,
		CEILING: 4,
	},
		
		stickState :1,
		
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			this.addAnim("idle", 0.4, [0,1]);
			this.currentAnim = this.anims.idle;
			
			//figure it out
			this.stickState = this.STATE.STANDING;
		},
		
		update: function() {
			//move logic here
			//freeze if nothing to do
			
			
			var go = true;
			if (this.stasis)
				go = false;
			while (go) {
				go = false;
				switch(this.stickState) {
					case this.STATE.STANDING:
						go = this.onFloor();
						break;
					case this.STATE.LEFTWALL:
						go = this.onLeftWall();
						break;
					case this.STATE.RIGHTWALL:
						go = this.onRightWall();
						break;
					case this.STATE.CEILING:
						go = this.onCeiling();
						break;
					default:
						break;
				}
			}
			
			
			//parent update
			this.parent();
			
			//size changes from animation
			if (this.currentAnim.frame == 2) {
				this.size = this.moveSize;
				this.offset = this.moveOffset;
			}
			else {
				this.size = this.regSize;
				this.offset = this.regOffset;
			}
			
		},
		
		onFloor: function() {
			//check if we are at an edge, either left or right
			//split the two up, combine them with trinary magic later
			//clarity firstChild
			
			var tileCoords = tileUtil.pxToTile(this.pos.x, this.pos.y);
			
			//left-facing
			if (this.flip) {
				//left edge, turn down onto right wall
				var checkTile = {tX: tileCoords.tX, tY: tileCoords.tY+1};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'x') > 0.5) {
					console.log("Presence: " ,tileUtil.tilePresence(checkTile, this, 'x'));
					this.offset.y = 3;
					this.currentAnim.angle = 3*Math.PI/2;
					this.stickState = this.STATE.RIGHTWALL;
					this.pos.x = tileCheckPx.pX + this.offset.y;
					this.pos.y = tileCheckPx.pY - this.size.x/2;
					this.gravityFactor = 0;
					
					//this.pos.y += ig.game.collisionMap.tilesize - this.size.y/2;
					//this.pos.x -= ig.game.collisionMap.tilesize - this.size.x/2 -4;
					return false;
					
				}
			}
			//right-facing
			else {
				var checkTile = {tX: tileCoords.tX + 1, tY: tileCoords.tY+1};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				//right edge, turn down onto left wall
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'x') > 0.5) {
						this.offset.y = 1;
						this.currentAnim.angle = Math.PI/2;
						this.stickState = this.STATE.LEFTWALL;
						
						this.pos.x = tileCheckPx.pX;
						this.pos.y = tileCheckPx.pY - this.size.x/2;
						this.gravityFactor = 0;
						
						//this.pos.y += ig.game.collisionMap.tilesize;
						//this.pos.x += ig.game.collisionMap.tilesize - (this.size.x/2);
						return true;
				}
			}
			
			//other alternatives
			
			//normal standing behavior
			
			var xdir = this.flip ? -1 : 1;
			this.vel.x = this.speed *xdir;
			this.currentAnim.flip.x = this.flip;
			return false;
		},
		
		onRightWall: function() {
				var tileCoords = tileUtil.pxToTile(this.pos.x, this.pos.y);
			if (this.flip) {
				//facing down, turning right into ceiling
				var checkTile = {tX: tileCoords.tX+1, tY: tileCoords.tY+1};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'y') > 0.5) {
					console.log("Presence: " ,tileUtil.tilePresence(checkTile, this, 'y'));
					this.offset.y = 1;
					this.currentAnim.angle = Math.PI;
					this.stickState = this.STATE.CEILING;
					this.pos.x = tileCheckPx.pX - this.size.x/2;
					this.pos.y = tileCheckPx.pY;
					this.gravityFactor = 0;
					this.vel.x = 0;
					this.vel.y = 0;
					
					
					//this.pos.y += ig.game.collisionMap.tilesize - this.size.y/2;
					//this.pos.x -= ig.game.collisionMap.tilesize - this.size.x/2 -4;
					return false;
					
				}
			}
			//facing up, turning right onto floor
			else {
				var checkTile = {tX: tileCoords.tX + 1, tY: tileCoords.tY};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				//right edge, turn down onto left wall
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'y') > 0.5) {
						this.offset.y = 1;
						this.currentAnim.angle = Math.PI;
						this.stickState = this.STATE.STANDING;
						
						this.pos.x = tileCheckPx.pX - this.size.x/2;
						this.pos.y = tileCheckPx.pY;
						this.gravityFactor = 0;
						this.vel.x = 0;
						this.vel.y = 0;
						
						//this.pos.y += ig.game.collisionMap.tilesize;
						//this.pos.x += ig.game.collisionMap.tilesize - (this.size.x/2);
						return true;
				}
			}
			
			var ydir = this.flip? 1: -1;
			this.vel.y = this.speed*ydir;
			this.vel.x = 0;
			//flip anim?
			return false;
			
			
			
			
		},
		
		onCeiling: function() {
			var tileCoords = tileUtil.pxToTile(this.pos.x, this.pos.y);
			
			//right facing
			if (this.flip) {
				//right edge, turn up onto left wall
				var checkTile = {tX: tileCoords.tX+1, tY: tileCoords.tY-1};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'x') > 0.5) {
					this.offset.y = 1;
					this.currentAnim.angle = Math.PI/2;
					this.stickState = this.STATE.LEFTWALL;
					this.pos.x = tileCheckPx.pX;
					this.pos.y = tileCheckPx.pY + this.size.x/2;
					this.gravityFactor = 0;
					
					//this.pos.y += ig.game.collisionMap.tilesize - this.size.y/2;
					//this.pos.x -= ig.game.collisionMap.tilesize - this.size.x/2 -4;
					return false;
					
				}
			}
			//left facing
			else {
				var checkTile = {tX: tileCoords.tX, tY: tileCoords.tY-1};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				//left edge, turn up onto right wall
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'x') > 0.5) {
						this.offset.y = 3;
						this.currentAnim.angle = 3*Math.PI/2;
						this.stickState = this.STATE.RIGHTWALL;
						
						this.pos.x = tileCheckPx.pX - this.offset.y;
						this.pos.y = tileCheckPx.pY + this.size.x/2;
						this.gravityFactor = 0;
						
						//this.pos.y += ig.game.collisionMap.tilesize;
						//this.pos.x += ig.game.collisionMap.tilesize - (this.size.x/2);
						return true;
				}
			}
			
			//other alternatives
			
			//normal standing behavior
			
			var xdir = this.flip ? 1 : -1;
			this.vel.x = this.speed *xdir;
			this.currentAnim.flip.x = this.flip;
			return false;
		},
		
		onLeftWall: function() {
			var tileCoords = tileUtil.pxToTile(this.pos.x, this.pos.y);
			if (this.flip) {
				//facing up, turning left into floor
				var checkTile = {tX: tileCoords.tX-1, tY: tileCoords.tY};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'y') > 0.5) {
					this.offset.y = 1;
					this.currentAnim.angle = 0;
					this.stickState = this.STATE.STANDING;
					this.pos.x = tileCheckPx.pX + this.size.x/2;
					this.pos.y = tileCheckPx.pY;
					this.gravityFactor = 0;
					this.vel.x = 0;
					this.vel.y = 0;
					
					
					//this.pos.y += ig.game.collisionMap.tilesize - this.size.y/2;
					//this.pos.x -= ig.game.collisionMap.tilesize - this.size.x/2 -4;
					return false;
					
				}
			}
			//facing down, turning left onto ceiling
			else {
				var checkTile = {tX: tileCoords.tX -1, tY: tileCoords.tY+1};
				var tileCheckPx = tileUtil.tileToPx(checkTile.tX, checkTile.tY);
				//right edge, turn down onto left wall
				if (!ig.game.collisionMap.getTile(tileCheckPx.pX, tileCheckPx.pY) && tileUtil.tilePresence(checkTile, this, 'y') > 0.5) {
						this.offset.y = 1;
						this.currentAnim.angle = Math.PI;
						this.stickState = this.STATE.CEILING;
						
						this.pos.x = tileCheckPx.pX + this.size.x/2;
						this.pos.y = tileCheckPx.pY;
						this.gravityFactor = 0;
						this.vel.x = 0;
						this.vel.y = 0;
						
						//this.pos.y += ig.game.collisionMap.tilesize;
						//this.pos.x += ig.game.collisionMap.tilesize - (this.size.x/2);
						return true;
				}
			}
			
			var ydir = this.flip? -1: 1;
			this.vel.y = this.speed*ydir;
			this.vel.x = 0;
			//flip anim?
			return false;
		},
		
		check: function(other) {
			other.receiveDamage(5, this);
			ig.Entity.solveCollision(this,other);
		},
		
		
	});
	
	
});