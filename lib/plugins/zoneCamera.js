//zone camera
//uses invisible "zone" entities for viewing
//extends camera plugin

ig.module('plugins.zoneCamera')
.requires('plugins.camera')
.defines( function() { "use strict;"

	ig.ZoneCamera = ig.Camera.extend({
	min : {x: 0, y:0},
	zoneRef: null,
	
	init: function( offsetX, offsetY, damping ) {
		this.parent(offsetX, offsetY, damping);
	},
	
	
	setZone: function(zoneEnt) {
		ig.game.zoneSet(zoneEnt);
		this.min.x = zoneEnt.pos.x;
		this.min.y = zoneEnt.pos.y;
		this.max.x = zoneEnt.pos.x + zoneEnt.size.x - ig.system.width;
		this.max.y = zoneEnt.pos.y + zoneEnt.size.y - ig.system.height;
		this.zoneRef = zoneEnt;
		if (this.max.x < this.min.x) {
			this.max.x = this.min.x;
		}
		if (this.max.y < this.min.y) {
			this.max.y = this.min.y;
		}
	},
	
	follow: function( entity) {
		if (!(this.zoneRef && entity.touches(this.zoneRef))) {
			this.findZone(entity);
		}
		this.parent(entity);
	},
	
	//find the zone the entity is in: if no zone, assume global camera parameters
	findZone: function (entity) {
		var zones = ig.game.getEntitiesByType('EntityZone');
		for (var i = 0; i < zones.length; i++) {
			if (entity.touches(zones[i])) {
				this.setZone(zones[i]);
				console.log("Found zone named ", zones[i].name);
				return;
			}
		}
		//player is not touching any known zones, make global settings for now
		//freak out
		//console.log("This shouldn't be happening");
		this.zoneRef = null;
		this.min.x = 0;
		this.min.y = 0;
		this.max.x = ig.game.collisionMap.pxWidth - ig.system.width;
		this.max.y = ig.game.collisionMap.pxHeight - ig.system.height;
	},
	
	//override move to include minimum camera settings
	move: function( axis, pos, size ) {
		var lookAhead = 0;
		if( pos < this.trap.pos[axis] ) {
			this.trap.pos[axis] = pos;
			this.currentLookAhead[axis] = this.lookAhead[axis];
		}
		else if( pos + size > this.trap.pos[axis] + this.trap.size[axis] ) {
			this.trap.pos[axis] = pos + size - this.trap.size[axis];
			this.currentLookAhead[axis] = -this.lookAhead[axis];
		}
		
		
		return (
			this.pos[axis] - (
				this.pos[axis] - this.trap.pos[axis] + this.offset[axis]
				+ this.currentLookAhead[axis]
			) * ig.system.tick * this.damping
		).limit( this.min[axis], this.max[axis] );
	},
	
	});
});