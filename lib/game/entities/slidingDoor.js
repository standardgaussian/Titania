//sliding door
//when triggered, either creates blocks or removes them
//force specific tile for now: add tile-choosing functionality later
//may add mapname functionality as well: for now, all relevant visible maps that will interact with doors are called "foreground"

ig.module('game.entities.slidingDoor')
.requires('impact.entity',
		'plugins.tileUtil',
		'impact.game'
)
.defines(function() {
	EntitySlidingDoor = ig.Entity.extend({
		_wmScalable: true,
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(0,0 , 255, 0.7)',
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.NEVER,
		
		//0 is open
		//1 is closed
		
		state : 0,
		retrigger: false,
		triggered: false,
		doorTile: 29,
		foregroundLayer: -1,
		
		//draw closed doors directly onto map, this entity will remove them when triggered
		init: function(x,y,settings) {
			this.parent(x,y,settings);
			if ("state" in settings) {
				this.state = settings.state;
			}
			if ("retrigger" in settings) {
				this.retrigger = settings.retrigger;
			}
			
			//default: do nothing
			if (this.state == 0) {
				//this.openDoors();
			}
			
			//start with the doors closed
			else if (this.state == 1) {
				//this.closeDoors();
			}
			
			
			
		},
		
		triggeredBy: function(other) {
			//if it's already triggered, do nothing
			if (this.triggered) {
				return;
			}
			
			//the door is open: close it
			if (this.state == 0) {
				this.closeDoors();
				this.state = 1;
			}
			
			//the door is closed: open it
			else if (this.state == 1) {
				this.openDoors();
				this.state = 0;
			}
			
			
			//if we can trigger it again, don't set the triggered status
			if (!this.retrigger) {
				this.triggered = true;
			}	
		},
		
		placeTiles: function(collisionTile, doorTile) {
			var tilesize = ig.game.collisionMap.tilesize;
			var xstart = this.pos.x;
			var ystart = this.pos.y;
			var xlength = Math.floor(this.size.x/tilesize);
			var ylength = Math.floor(this.size.y/tilesize);
			for (var i = 0; i < xlength; i++) {
				for (var j = 0; j < ylength; j++) {
					//set the collision tile
					ig.game.collisionMap.setTile(xstart + i*tilesize, ystart + j*tilesize, collisionTile);
					//set the foreground tile, finding the foreground layer if not yet known
					if (this.foregroundLayer != -1) {
						ig.game.backgroundMaps[this.foregroundLayer].setTile(xstart + i*tilesize, ystart + j*tilesize, doorTile); 
					}
					else {
						//find the foreground layer
						for(var i = 0; i < ig.game.backgroundMaps.length; i++) {
							if (ig.game.backgroundMaps[i].name == "foreground") {
								this.foregroundLayer = i;
								ig.game.backgroundMaps[i].setTile(xstart + i*tilesize, ystart + j*tilesize, doorTile); 
								break;
							}
						}
					}
				}
			}
			
		},
		
		openDoors: function() {
			this.placeTiles(0, 0);
		},
		
		closeDoors: function() {
			this.placeTiles(1, this.doorTile);
		},
		
		update: function() {},
		
		
	});
});